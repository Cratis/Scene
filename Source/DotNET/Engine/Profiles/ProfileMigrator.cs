// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Cratis.Scene.Engine.Screens;
using Cratis.Scene.Engine.Templates;
using Cratis.Scene.Model.Packages;
using Cratis.Scene.Model.Profiles;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// Turns a legacy profile - the blueprint (<see cref="LegacyProfile.Shell"/>) and layout name, and the Studio-only settings that sat next to
/// them - into the shape the root template redesign gives it, in one pure step every host uses (Studio's migration, the Screenplay fix-it,
/// the CLI). The TypeScript twin is <c language="csharp">migrateLegacyProfile</c> in <c language="csharp">@cratis/scene.engine</c>; both are asserted against
/// the shared <c language="csharp">profile-migration-fixtures.json</c> corpus.
/// </summary>
/// <remarks>
/// <list type="bullet">
/// <item>The layout (the legacy shell first, then the application's own, then the installed blueprints) becomes <see cref="RootTemplate.Template"/>:
/// a blueprint layout is a blueprint reference pinned to <c language="csharp">^&lt;installed major.minor&gt;</c>, an application layout an own reference. With a shell and no layout the blueprint's first usable
/// shell stands in. No shell and no layout: no root (the built-in Bare shell).</item>
/// <item><see cref="LegacyProfile.NavigationMode"/> becomes the root's <c language="csharp">navigationMode</c> option; <see cref="LegacyProfile.ColorScheme"/> and <see cref="LegacyProfile.Accent"/> become the
/// appearance; <see cref="LegacyProfile.DefaultScreenTemplate"/> becomes <see cref="ProfileDefaults.NewScreenTemplate"/>.</item>
/// <item>Values already in the new shape win over their legacy counterparts, so the function is idempotent: a migrated profile comes back unchanged, with
/// or without the legacy fields next to it. Once a root exists the legacy layout name is dropped.</item>
/// <item>What cannot be mapped is reported in <see cref="ProfileMigration.Diagnostics"/> (never thrown) and stays as it was.</item>
/// </list>
/// </remarks>
public static partial class ProfileMigrator
{
    /// <summary>
    /// The option of the root template the legacy navigation mode becomes.
    /// </summary>
    public const string NavigationModeOption = "navigationMode";

    /// <summary>
    /// Migrates a legacy profile to the root template shape.
    /// </summary>
    /// <param name="legacy">The profile and the legacy settings next to it.</param>
    /// <param name="library">The application's own templates and the blueprints available, which the names are looked up in.</param>
    /// <returns>The migrated profile, whether it changed, and what could not be mapped.</returns>
    public static ProfileMigration Migrate(LegacyProfile legacy, TemplateLibrary library)
    {
        var diagnostics = new List<ProfileMigrationDiagnostic>();
        var profile = legacy.Profile;
        var layout = NonBlank(legacy.Layout) ?? NonBlank(profile.Layout);

        var root = profile.Root;
        if (root is null)
        {
            var template = DeriveRoot(NonBlank(legacy.Shell), layout, profile, library, diagnostics);
            if (template is not null)
            {
                root = new RootTemplate(template);
                layout = null;
            }
        }
        else
        {
            layout = null;
        }

        var navigationMode = NonBlank(legacy.NavigationMode);
        if (navigationMode is not null)
        {
            if (root is null)
            {
                diagnostics.Add(new(
                    ProfileMigrationDiagnosticCode.LegacyNavigationModeWithoutRoot,
                    $"Navigation mode '{navigationMode}' of profile '{profile.Name}' cannot be kept: the profile has no root template to carry it",
                    navigationMode));
            }
            else if (root.Options?.ContainsKey(NavigationModeOption) != true)
            {
                var options = new Dictionary<string, JsonNode?>(root.Options ?? new Dictionary<string, JsonNode?>(), StringComparer.Ordinal)
                {
                    [NavigationModeOption] = JsonValue.Create(navigationMode)
                };
                root = root with { Options = options };
            }
        }

        var migrated = profile with
        {
            Layout = layout,
            Root = root,
            Appearance = AppearanceOf(legacy, profile.Appearance, diagnostics),
            Defaults = DefaultsOf(legacy, profile, library, diagnostics)
        };

        var changed = !string.Equals(UiProfileJson.Serialize(migrated), UiProfileJson.Serialize(profile), StringComparison.Ordinal);
        return new ProfileMigration(migrated, changed, diagnostics);
    }

    static TemplateReference? DeriveRoot(string? shell, string? layout, UiProfile profile, TemplateLibrary library, List<ProfileMigrationDiagnostic> diagnostics)
    {
        if (shell is null && layout is null)
        {
            return null;
        }

        if (shell is null)
        {
            return FromLayoutName(layout!, null, profile, library, diagnostics);
        }

        var blueprint = library.Blueprints.FirstOrDefault(candidate => candidate.Manifest.Name == shell && candidate.Manifest.Kind == PackageKind.Blueprint);
        if (blueprint is null)
        {
            diagnostics.Add(new(
                ProfileMigrationDiagnosticCode.LegacyShellNotInstalled,
                $"Shell '{shell}' of profile '{profile.Name}' is not an available blueprint",
                shell));
            return layout is null ? null : FromLayoutName(layout, null, profile, library, diagnostics);
        }

        if (layout is not null)
        {
            return FromLayoutName(layout, blueprint, profile, library, diagnostics);
        }

        var first = FirstShellOf(blueprint);
        if (first is null)
        {
            diagnostics.Add(new(
                ProfileMigrationDiagnosticCode.LegacyShellHasNoLayout,
                $"Blueprint '{shell}' of profile '{profile.Name}' provides no layout or root template an application can use as its shell",
                shell));
            return null;
        }

        return BlueprintReference(blueprint, first);
    }

    static TemplateReference? FromLayoutName(string name, TemplateSource? preferred, UiProfile profile, TemplateLibrary library, List<ProfileMigrationDiagnostic> diagnostics)
    {
        if (preferred is not null && HasShell(preferred, name))
        {
            return BlueprintReference(preferred, name);
        }

        if (library.Own is not null && HasShell(library.Own, name))
        {
            return new TemplateReference(TemplateReferenceSource.Own, name);
        }

        foreach (var blueprint in library.Blueprints.Where(candidate => profile.Packages.Contains(candidate.Manifest.Name)))
        {
            if (HasShell(blueprint, name))
            {
                return BlueprintReference(blueprint, name);
            }
        }

        var where = preferred is null ? "any installed blueprint" : $"blueprint '{preferred.Manifest.Name}'";
        diagnostics.Add(new(
            ProfileMigrationDiagnosticCode.LegacyLayoutUnknown,
            $"Layout '{name}' of profile '{profile.Name}' does not exist in the application or in {where}",
            name));
        return null;
    }

    static bool HasShell(TemplateSource source, string name) =>
        (source.Layouts ?? []).Any(layout => layout.Name == name)
        || (source.ScreenTemplates ?? []).Any(template => template.Name == name && template.Metadata?.Role == TemplateRole.Root);

    static string? FirstShellOf(TemplateSource source)
    {
        var layout = (source.Layouts ?? []).FirstOrDefault(candidate => TemplateApplicability.ValidateLayout(candidate, TemplateScope.Application).Count == 0);
        if (layout is not null)
        {
            return layout.Name;
        }

        return (source.ScreenTemplates ?? []).FirstOrDefault(candidate =>
            candidate.Metadata?.Role == TemplateRole.Root && TemplateApplicability.ValidateScreenTemplate(candidate, TemplateScope.Application).Count == 0)?.Name;
    }

    static TemplateReference BlueprintReference(TemplateSource blueprint, string id)
    {
        var match = VersionPrefix().Match(blueprint.Manifest.Version.Trim());
        var pin = match.Success ? $"^{match.Groups["major"].Value}.{match.Groups["minor"].Value}" : null;
        return new TemplateReference(TemplateReferenceSource.Blueprint, id, blueprint.Manifest.Name, pin);
    }

    static ProfileAppearance? AppearanceOf(LegacyProfile legacy, ProfileAppearance? existing, List<ProfileMigrationDiagnostic> diagnostics)
    {
        var colorScheme = existing?.ColorScheme;
        var accent = existing?.Accent;

        var scheme = NonBlank(legacy.ColorScheme);
        if (scheme is not null && colorScheme is null)
        {
            colorScheme = ColorSchemeOf(scheme);
            if (colorScheme is null)
            {
                diagnostics.Add(new(
                    ProfileMigrationDiagnosticCode.LegacyColorSchemeUnknown,
                    $"Colour scheme '{scheme}' of profile '{legacy.Profile.Name}' is not Light, Dark or System",
                    scheme));
            }
        }

        var legacyAccent = NonBlank(legacy.Accent);
        if (legacyAccent is not null && accent is null)
        {
            accent = legacyAccent;
        }

        return colorScheme is null && accent is null ? null : new ProfileAppearance(colorScheme, accent);
    }

    static ColorScheme? ColorSchemeOf(string value) => value.ToLowerInvariant() switch
    {
        "light" => ColorScheme.Light,
        "dark" => ColorScheme.Dark,
        "system" => ColorScheme.System,
        _ => null
    };

    static ProfileDefaults? DefaultsOf(LegacyProfile legacy, UiProfile profile, TemplateLibrary library, List<ProfileMigrationDiagnostic> diagnostics)
    {
        var reference = profile.Defaults?.NewScreenTemplate;
        var name = NonBlank(legacy.DefaultScreenTemplate);
        if (name is not null && reference is null)
        {
            reference = ScreenTemplateReference(name, profile, library);
            if (reference is null)
            {
                diagnostics.Add(new(
                    ProfileMigrationDiagnosticCode.LegacyDefaultScreenTemplateUnknown,
                    $"Screen template '{name}', the default for new screens of profile '{profile.Name}', does not exist in the application or in any installed blueprint",
                    name));
            }
        }

        return reference is null ? null : (profile.Defaults ?? new ProfileDefaults()) with { NewScreenTemplate = reference };
    }

    static TemplateReference? ScreenTemplateReference(string name, UiProfile profile, TemplateLibrary library)
    {
        if ((library.Own?.ScreenTemplates ?? []).Any(template => template.Name == name))
        {
            return new TemplateReference(TemplateReferenceSource.Own, name);
        }

        var blueprint = library.Blueprints.FirstOrDefault(candidate => profile.Packages.Contains(candidate.Manifest.Name)
            && (candidate.ScreenTemplates ?? []).Any(template => template.Name == name));
        return blueprint is null ? null : BlueprintReference(blueprint, name);
    }

    static string? NonBlank(string? value)
    {
        var trimmed = value?.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    [GeneratedRegex(@"^(?<major>\d+)\.(?<minor>\d+)", RegexOptions.None, matchTimeoutMilliseconds: 200)]
    private static partial Regex VersionPrefix();
}
