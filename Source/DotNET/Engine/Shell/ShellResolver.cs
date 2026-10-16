// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Scene.Engine.Blueprints;
using Cratis.Scene.Engine.Profiles;
using Cratis.Scene.Engine.Screens;
using Cratis.Scene.Engine.Templates;
using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.Packages;
using Cratis.Scene.Model.Profiles;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Shell;

/// <summary>
/// Resolves the application's shell: the one function every host (the preview host, Stage, the CLI, Studio's canvases and the
/// Screenplay validator) calls, so there is no second implementation of "what is the shell?". The TypeScript twin is
/// <c language="csharp">resolveEffectiveShell</c> in <c language="csharp">@cratis/scene.engine</c>; both are asserted against the shared
/// <c language="csharp">effective-shell-fixtures.json</c> corpus.
/// </summary>
/// <remarks>
/// <para>
/// The order is the profile's root template, then its legacy layout name, then the default layout of the first installed blueprint,
/// then the built-in bare shell (one <c language="csharp">content</c> outlet, no chrome). A candidate that cannot be used at all (it
/// does not exist, its blueprint is not available, it is not something an application can use as a shell) is reported and the next
/// one is tried, so there is always a shell to render. A candidate that exists but is wrong in a way the host can still show (its
/// pin is drifted, it lacks the content outlet, the blueprint is available but not added to the packages) is used and reported.
/// </para>
/// <para>
/// Besides the root's own problems, the profile around it is checked: the theme against the profile's packages, the packages
/// against the available ones, and - when the screens are given - that every screen's content has an outlet to go to.
/// </para>
/// </remarks>
public static class ShellResolver
{
    /// <summary>
    /// The name of the built-in shell that is used when a profile chooses none and no blueprint offers one.
    /// </summary>
    public const string BareShellName = "Bare";

    const string DefaultPrimaryOutlet = "content";

    static readonly Layout _bareShell = new(BareShellName, [new Slot(DefaultPrimaryOutlet)]);

    /// <summary>
    /// Resolves the effective shell of an application.
    /// </summary>
    /// <param name="profile">The UI profile.</param>
    /// <param name="context">The templates, screens, themes and packages to resolve against.</param>
    /// <returns>The effective shell with its outlets, options and every diagnostic.</returns>
    public static EffectiveShell Resolve(UiProfile profile, ShellResolutionContext context)
    {
        var diagnostics = new List<ShellDiagnostic>();
        var installed = InstalledBlueprints(profile, context);

        EffectiveShell? shell = null;
        if (profile.Root is not null)
        {
            shell = FromReference(profile.Root.Template, ShellOrigin.Root, profile, context, diagnostics, profile.Root.Options);
        }

        if (shell is null && !string.IsNullOrWhiteSpace(profile.Layout))
        {
            shell = FromLegacyLayout(profile.Layout, profile, context, installed, diagnostics);
        }

        shell ??= FromBlueprintDefault(installed);
        shell ??= Bare();

        var all = new List<ShellDiagnostic>(diagnostics);
        var templates = ShellPlacement.PlaceableScreenTemplates(profile, context).ToList();
        CheckContentOutlet(shell, all);
        CheckCycles(shell, templates, all);
        CheckProfile(profile, context, all);
        CheckScreens(shell, context, templates, all);
        return shell with { Diagnostics = all };
    }

    /// <summary>The blueprints among the profile's packages that the library holds, in the profile's order.</summary>
    /// <param name="profile">The profile.</param>
    /// <param name="context">The library.</param>
    /// <returns>The installed blueprints.</returns>
    internal static List<TemplateSource> InstalledBlueprints(UiProfile profile, ShellResolutionContext context) =>
        [.. profile.Packages
            .Select(name => context.Library.Blueprints.FirstOrDefault(source => source.Manifest.Name == name && source.Manifest.Kind == PackageKind.Blueprint))
            .OfType<TemplateSource>()];

    static EffectiveShell? FromReference(
        TemplateReference reference,
        ShellOrigin origin,
        UiProfile profile,
        ShellResolutionContext context,
        List<ShellDiagnostic> diagnostics,
        IReadOnlyDictionary<string, JsonNode?>? options)
    {
        var resolution = TemplateReferenceResolver.Resolve(reference, context.Library);
        var label = ReferenceLabel(reference);

        switch (resolution.Status)
        {
            case TemplateReferenceStatus.Malformed:
            case TemplateReferenceStatus.UnknownTemplate:
                diagnostics.Add(new(ShellDiagnosticCode.RootTemplateUnknown, $"Root template {label} cannot be used: {resolution.Message}", reference.Id));
                return null;
            case TemplateReferenceStatus.UnknownBlueprint:
                diagnostics.Add(new(ShellDiagnosticCode.RootTemplateBlueprintNotInstalled, $"Root template {label} comes from blueprint '{reference.Blueprint}', which is not installed", reference.Blueprint));
                return null;
        }

        var isBlueprint = reference.Source == TemplateReferenceSource.Blueprint;
        var source = isBlueprint
            ? context.Library.Blueprints.FirstOrDefault(candidate => candidate.Manifest.Name == reference.Blueprint)
            : context.Library.Own;
        var found = source is null ? null : FindShell(reference.Id, source, isBlueprint);
        if (found is null)
        {
            if (resolution.Status == TemplateReferenceStatus.Resolved)
            {
                diagnostics.Add(new(
                    ShellDiagnosticCode.RootTemplateNotApplicable,
                    $"Root template {label} cannot be the application's shell: it is a {KindName(resolution.Kind)}, and only a layout or a screen template with the root role can be a shell",
                    reference.Id));
            }
            else
            {
                diagnostics.Add(new(ShellDiagnosticCode.RootTemplateVersionNotSatisfied, $"Root template {label} cannot be used: {resolution.Message}", reference.Id));
            }

            return null;
        }

        var problems = found.Kind == ShellKind.Layout
            ? TemplateApplicability.ValidateLayout(found.Layout, TemplateScope.Application)
            : TemplateApplicability.ValidateScreenTemplate(found.ScreenTemplate, TemplateScope.Application);
        if (problems.Count > 0)
        {
            diagnostics.Add(new(ShellDiagnosticCode.RootTemplateNotApplicable, $"Root template {label} cannot be the application's shell: {string.Join("; ", problems)}", reference.Id));
            return null;
        }

        if (resolution.Status == TemplateReferenceStatus.VersionNotSatisfied)
        {
            diagnostics.Add(new(ShellDiagnosticCode.RootTemplateVersionNotSatisfied, resolution.Message!, reference.Id));
        }

        if (found.IsBlueprint && !profile.Packages.Contains(reference.Blueprint!))
        {
            diagnostics.Add(new(
                ShellDiagnosticCode.RootTemplateBlueprintNotInstalled,
                $"Root template {label} comes from blueprint '{reference.Blueprint}', which is available but not among the packages of profile '{profile.Name}'",
                reference.Blueprint));
        }

        return Build(found, origin, reference, options);
    }

    static EffectiveShell? FromLegacyLayout(
        string name,
        UiProfile profile,
        ShellResolutionContext context,
        List<TemplateSource> installed,
        List<ShellDiagnostic> diagnostics)
    {
        var own = context.Library.Own is null ? null : FindLayout(name, context.Library.Own, false);
        if (own is not null)
        {
            return Build(own, ShellOrigin.LegacyLayout, new TemplateReference(TemplateReferenceSource.Own, name));
        }

        foreach (var blueprint in installed)
        {
            var found = FindLayout(name, blueprint, true);
            if (found is not null)
            {
                return Build(found, ShellOrigin.LegacyLayout, BlueprintReference(blueprint, name));
            }
        }

        diagnostics.Add(new(ShellDiagnosticCode.RootTemplateUnknown, $"Layout '{name}' named by profile '{profile.Name}' does not exist in the application or in any installed blueprint", name));
        return null;
    }

    static EffectiveShell? FromBlueprintDefault(List<TemplateSource> installed)
    {
        foreach (var blueprint in installed)
        {
            var layout = (blueprint.Layouts ?? []).FirstOrDefault(candidate => TemplateApplicability.ValidateLayout(candidate, TemplateScope.Application).Count == 0);
            if (layout is not null)
            {
                return Build(new Found(layout, null, ShellKind.Layout, blueprint, true), ShellOrigin.BlueprintDefault, BlueprintReference(blueprint, layout.Name));
            }

            var root = (blueprint.ScreenTemplates ?? []).FirstOrDefault(candidate =>
                candidate.Metadata?.Role == TemplateRole.Root && TemplateApplicability.ValidateScreenTemplate(candidate, TemplateScope.Application).Count == 0);
            if (root is not null)
            {
                return Build(new Found(null, root, ShellKind.ScreenTemplate, blueprint, true), ShellOrigin.BlueprintDefault, BlueprintReference(blueprint, root.Name));
            }
        }

        return null;
    }

    static EffectiveShell Bare() => new(
        ShellOrigin.Bare,
        null,
        ShellKind.Layout,
        ShellSource.BuiltIn,
        _bareShell.Name,
        [.. _bareShell.Slots.Select(slot => slot.Name)],
        DefaultPrimaryOutlet,
        new Dictionary<string, JsonNode?>(),
        [],
        Layout: _bareShell);

    static EffectiveShell Build(Found found, ShellOrigin origin, TemplateReference reference, IReadOnlyDictionary<string, JsonNode?>? options = null)
    {
        var name = found.Kind == ShellKind.Layout ? found.Layout!.Name : found.ScreenTemplate!.Name;
        var slots = found.Kind == ShellKind.Layout ? found.Layout!.Slots : found.ScreenTemplate!.Slots;
        var metadata = found.Kind == ShellKind.Layout ? found.Layout!.Metadata : found.ScreenTemplate!.Metadata;
        var pin = found.IsBlueprint && found.Source is not null ? BlueprintVersionPin.Evaluate(reference.Version, found.Source.Manifest.Version) : null;

        return new(
            origin,
            reference,
            found.Kind,
            found.IsBlueprint ? ShellSource.Blueprint : ShellSource.Own,
            name,
            [.. slots.Select(slot => slot.Name)],
            metadata?.PrimaryOutlet ?? DefaultPrimaryOutlet,
            new Dictionary<string, JsonNode?>(options ?? new Dictionary<string, JsonNode?>()),
            [],
            found.IsBlueprint && found.Source is not null ? found.Source.Manifest.Name : null,
            found.IsBlueprint && found.Source is not null ? found.Source.Manifest.Version : null,
            pin,
            found.Layout,
            found.ScreenTemplate);
    }

    static Found? FindShell(string name, TemplateSource source, bool isBlueprint) =>
        FindLayout(name, source, isBlueprint) ?? FindRootScreenTemplate(name, source, isBlueprint);

    static Found? FindLayout(string name, TemplateSource source, bool isBlueprint)
    {
        var layout = source.Layouts?.FirstOrDefault(candidate => candidate.Name == name);
        return layout is null ? null : new Found(layout, null, ShellKind.Layout, source, isBlueprint);
    }

    static Found? FindRootScreenTemplate(string name, TemplateSource source, bool isBlueprint)
    {
        var template = source.ScreenTemplates?.FirstOrDefault(candidate => candidate.Name == name && candidate.Metadata?.Role == TemplateRole.Root);
        return template is null ? null : new Found(null, template, ShellKind.ScreenTemplate, source, isBlueprint);
    }

    static TemplateReference BlueprintReference(TemplateSource blueprint, string id) =>
        new(TemplateReferenceSource.Blueprint, id, blueprint.Manifest.Name, BlueprintVersionPin.DefaultPin(blueprint.Manifest.Version));

    static string ReferenceLabel(TemplateReference reference) => $"'{reference.Id}'";

    static string KindName(TemplateCatalogKind? kind) => kind switch
    {
        TemplateCatalogKind.DialogTemplate => "dialog template",
        TemplateCatalogKind.ScreenTemplate => "screen template without the root role",
        _ => "template"
    };

    static void CheckContentOutlet(EffectiveShell shell, List<ShellDiagnostic> diagnostics)
    {
        if (!shell.Outlets.Contains(shell.PrimaryOutlet))
        {
            diagnostics.Add(new(ShellDiagnosticCode.RootTemplateMissingContentSlot, $"Shell '{shell.Name}' has no '{shell.PrimaryOutlet}' outlet, so no screen can be placed in it", shell.Name));
        }
    }

    static void CheckCycles(EffectiveShell shell, List<ScreenTemplate> templates, List<ShellDiagnostic> diagnostics)
    {
        var slots = shell.Layout?.Slots ?? shell.RootTemplate!.Slots;
        var resolution = ScreenTemplateResolver.Resolve(new Layout(shell.Name, slots), [.. templates.Where(template => template.Name != shell.Name)]);
        foreach (var cycle in resolution.Cycles)
        {
            var names = string.Join(" -> ", cycle.Append(cycle[0]).Select(name => $"'{name}'"));
            diagnostics.Add(new(ShellDiagnosticCode.RootTemplateCycle, $"Templates {names} contain each other and can never be placed inside shell '{shell.Name}'", cycle[0]));
        }
    }

    static void CheckProfile(UiProfile profile, ShellResolutionContext context, List<ShellDiagnostic> diagnostics)
    {
        var theme = profile.Theme is null ? null : context.Themes?.FirstOrDefault(candidate => candidate.Name == profile.Theme);
        if (theme is not null)
        {
            var incompatible = ThemeCompatibility.IncompatiblePackages(theme, profile);
            if (incompatible.Count > 0)
            {
                diagnostics.Add(new(
                    ShellDiagnosticCode.ProfileThemeIncompatible,
                    $"Theme '{theme.Name}' does not support {(incompatible.Count == 1 ? "package" : "packages")} {string.Join(", ", incompatible.Select(name => $"'{name}'"))} of profile '{profile.Name}'",
                    theme.Name));
            }
        }

        if (context.AvailablePackages is not null)
        {
            foreach (var name in profile.Packages.Where(candidate => !context.AvailablePackages.Contains(candidate)))
            {
                diagnostics.Add(new(ShellDiagnosticCode.ProfilePackageMissing, $"Package '{name}' of profile '{profile.Name}' is not available", name));
            }
        }
    }

    static void CheckScreens(EffectiveShell shell, ShellResolutionContext context, List<ScreenTemplate> templates, List<ShellDiagnostic> diagnostics)
    {
        foreach (var screen in context.Screens ?? [])
        {
            foreach (var outlet in ShellPlacement.OutletsUsedBy(screen, shell.Name, templates).Where(outlet => !shell.Outlets.Contains(outlet)))
            {
                diagnostics.Add(new(ShellDiagnosticCode.ProfileSlotUnplaced, $"Screen '{screen.Name}' places content in outlet '{outlet}', which shell '{shell.Name}' does not have", screen.Name));
            }
        }
    }

    sealed record Found(Layout? Layout, ScreenTemplate? ScreenTemplate, ShellKind Kind, TemplateSource? Source, bool IsBlueprint);
}
