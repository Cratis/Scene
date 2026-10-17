// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Packages;
using Cratis.Scene.Engine.Profiles;
using Cratis.Scene.Engine.SampleData;
using Cratis.Scene.Engine.Screens;
using Cratis.Scene.Engine.Templates;
using Cratis.Scene.Model.Packages;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Blueprints;

/// <summary>
/// The definition of done for a blueprint (spec Part B 6), as rules a package can be held to: valid manifest and version; for a domain
/// blueprint its domain, description, thumbnail and screen set; every template with complete metadata, a category, a type from the
/// vocabulary, a description and a thumbnail; every template placed by the slot resolver, with nothing unplaced, ambiguous or nested in
/// itself (ambiguity is only a problem for a domain blueprint: the foundation's generic nesting chain fits slots many templates declare, and is
/// chosen explicitly); sample data present, locale-tagged and valid; and a dependency on the foundation set. Reports the same problems in the same
/// order as the TypeScript engine (<c language="csharp">verifyBlueprintPackage</c>); both are asserted against
/// <c language="csharp">blueprint-verification-fixtures.json</c>.
/// </summary>
public static class BlueprintVerification
{
    /// <summary>
    /// Verifies a blueprint package.
    /// </summary>
    /// <param name="source">The blueprint to verify.</param>
    /// <param name="library">The other packages available - above all the foundation set - so templates can be placed into its layouts and checked against its versions.</param>
    /// <param name="options">How strictly to verify.</param>
    /// <returns>The problems; empty when the blueprint is done.</returns>
    public static IReadOnlyList<string> Verify(BlueprintSource source, IReadOnlyList<TemplateSource>? library = null, BlueprintVerificationOptions? options = null)
    {
        library ??= [];
        options ??= new();
        var manifest = source.Manifest;
        var name = manifest.Name;
        var label = $"Blueprint '{name}'";
        var foundation = options.FoundationPackage ?? BlueprintRules.FoundationPackageName;

        if (manifest.Kind != PackageKind.Blueprint)
        {
            return [$"Package '{name}' is not a Blueprint package"];
        }

        var problems = new List<string>();
        if (!PackageVersionRange.IsValidVersion(manifest.Version))
        {
            problems.Add($"{label} declares an invalid version '{manifest.Version ?? string.Empty}'");
        }

        var blueprint = manifest.Blueprint;
        var domain = blueprint is not null;
        var available = (source.ScreenTemplates ?? []).Concat(library.SelectMany(other => other.ScreenTemplates ?? [])).Select(template => template.Name).ToHashSet(StringComparer.Ordinal);
        var references = manifest.SampleData ?? [];

        if (blueprint is null)
        {
            if (options.RequireBlueprintMetadata)
            {
                problems.Add($"{label} declares no blueprint metadata (domain, description, thumbnail and screen set)");
            }
        }
        else
        {
            if (string.IsNullOrWhiteSpace(blueprint.Domain))
            {
                problems.Add($"{label} declares no domain");
            }
            else if (!BlueprintRules.IsValidDomain(blueprint.Domain))
            {
                problems.Add($"{label} declares an invalid domain '{blueprint.Domain}'; use lower-case words separated by '-'");
            }

            if (string.IsNullOrWhiteSpace(blueprint.Description))
            {
                problems.Add($"{label} declares no description");
            }
            else if (blueprint.Description.Length > BlueprintRules.MaximumDescriptionLength)
            {
                problems.Add($"{label} declares a description longer than {BlueprintRules.MaximumDescriptionLength} characters");
            }

            problems.AddRange(ThumbnailProblems(label, blueprint.Thumbnail, source.Files));
            problems.AddRange(ScreenSetProblems(source, label, available));

            if (blueprint.DefaultSampleData is not null && !references.Any(reference => reference.Id == blueprint.DefaultSampleData))
            {
                problems.Add($"{label} declares default sample data '{blueprint.DefaultSampleData}', which is not one of its sample data packs");
            }

            if (references.Count == 0)
            {
                problems.Add($"{label} ships no sample data pack");
            }
            else if (references.Count > 1 && blueprint.DefaultSampleData is null)
            {
                problems.Add($"{label} ships several sample data packs but declares no default");
            }

            if (name != foundation && !manifest.Dependencies.Any(dependency => dependency.Name == foundation))
            {
                problems.Add($"{label} does not depend on the foundation set '{foundation}'");
            }
        }

        problems.AddRange(SampleDataValidation.ValidatePackages([new SampleDataPackSource(manifest, source.Packs)]));
        foreach (var reference in references)
        {
            if (source.Files?.Contains(reference.Path) == false)
            {
                problems.Add($"{label} sample data pack '{reference.Id}' names '{reference.Path}', which is not in the package");
            }
        }

        problems.AddRange(TemplateProblems(source, library, domain));
        problems.AddRange(PlacementProblems(source, library, label, domain));
        return problems;
    }

    static List<string> ThumbnailProblems(string owner, string? thumbnail, IReadOnlyList<string>? files)
    {
        if (string.IsNullOrWhiteSpace(thumbnail))
        {
            return [$"{owner} declares no thumbnail"];
        }

        if (!BlueprintRules.IsValidThumbnailPath(thumbnail))
        {
            return [$"{owner} declares thumbnail '{thumbnail}', which is not 'thumbnails/<name>.png|webp|jpg|svg'"];
        }

        return files?.Contains(thumbnail) == false ? [$"{owner} declares thumbnail '{thumbnail}', which is not in the package"] : [];
    }

    static List<string> ScreenSetProblems(BlueprintSource source, string label, HashSet<string> availableTemplates)
    {
        var set = source.Manifest.Blueprint!.ScreenSet ?? [];
        if (set.Count == 0)
        {
            return [$"{label} declares no ready-to-use screen set"];
        }

        var problems = new List<string>();
        var names = new HashSet<string>(StringComparer.Ordinal);
        foreach (var screen in set)
        {
            if (string.IsNullOrWhiteSpace(screen.Name))
            {
                problems.Add($"{label} declares a screen set entry without a name");
                continue;
            }

            if (names.Contains(screen.Name))
            {
                problems.Add($"{label} declares screen '{screen.Name}' more than once");
            }

            names.Add(screen.Name);
        }

        foreach (var screen in set.Where(screen => !string.IsNullOrWhiteSpace(screen.Name)))
        {
            var owner = $"{label} screen '{screen.Name}'";
            if (string.IsNullOrWhiteSpace(screen.Title))
            {
                problems.Add($"{owner} declares no title");
            }

            if (screen.Template is not null && !availableTemplates.Contains(screen.Template))
            {
                problems.Add($"{owner} uses template '{screen.Template}', which is not available");
            }

            if (screen.Parent is not null && !names.Contains(screen.Parent))
            {
                problems.Add($"{owner} has parent '{screen.Parent}', which is not in the screen set");
            }

            if (source.Screens?.Any(candidate => candidate.Name == screen.Name) == false)
            {
                problems.Add($"{owner} is named in the screen set but the package does not provide it");
            }
        }

        foreach (var screen in set)
        {
            if (screen.Parent is not null && names.Contains(screen.Parent) && IsOwnAncestor(screen.Name, set))
            {
                problems.Add($"{label} screen '{screen.Name}' is its own ancestor");
            }
        }

        return problems;
    }

    static bool IsOwnAncestor(string name, IReadOnlyList<BlueprintScreen> set)
    {
        var visited = new HashSet<string>(StringComparer.Ordinal);
        for (var current = set.FirstOrDefault(screen => screen.Name == name)?.Parent; current is not null; current = set.FirstOrDefault(screen => screen.Name == current)?.Parent)
        {
            if (current == name)
            {
                return true;
            }

            if (!visited.Add(current))
            {
                return false;
            }
        }

        return false;
    }

    static List<string> TemplateProblems(BlueprintSource source, IReadOnlyList<TemplateSource> library, bool domain)
    {
        var problems = new List<string>();
        var everyTemplate = (source.Layouts ?? []).Select(layout => (layout.Name, DisplayName: (string?)null, Description: (string?)null, layout.Metadata, Describable: false))
            .Concat((source.ScreenTemplates ?? []).Select(template => (template.Name, template.DisplayName, template.Description, template.Metadata, Describable: true)))
            .Concat((source.DialogTemplates ?? []).Select(template => (template.Name, template.DisplayName, template.Description, template.Metadata, Describable: true)));

        var others = library.Where(other => other.Manifest.Name != source.Manifest.Name);
        foreach (var entry in TemplateCatalog.Describe([source.AsTemplateSource(), .. others]).Where(candidate => candidate.Package == source.Manifest.Name))
        {
            problems.AddRange(entry.Problems);
        }

        foreach (var (templateName, displayName, description, metadata, describable) in everyTemplate)
        {
            var owner = $"Template '{templateName}'";
            if (describable && string.IsNullOrWhiteSpace(displayName))
            {
                problems.Add($"{owner} declares no display name");
            }

            if (describable && string.IsNullOrWhiteSpace(description))
            {
                problems.Add($"{owner} declares no description");
            }

            problems.AddRange(ShellCardProblems(owner, displayName, description, metadata, source.Files));

            if (!domain)
            {
                continue;
            }

            if (metadata?.Type is null)
            {
                problems.Add($"{owner} declares no type");
            }
            else if (!BlueprintRules.TemplateTypes.Contains(metadata.Type))
            {
                problems.Add($"{owner} declares type '{metadata.Type}', which is not one of {string.Join(", ", BlueprintRules.TemplateTypes)}");
            }

            if (metadata?.Category is { } category && category.Trim().Length > 0 && !category.StartsWith(BlueprintRules.BusinessCategoryPrefix, StringComparison.Ordinal))
            {
                problems.Add($"{owner} declares category '{category}', which does not start with '{BlueprintRules.BusinessCategoryPrefix}'");
            }

            problems.AddRange(ThumbnailProblems(owner, metadata?.Thumbnail, source.Files));
        }

        return problems;
    }

    static List<string> ShellCardProblems(string owner, string? displayName, string? description, TemplateMetadata? metadata, IReadOnlyList<string>? files)
    {
        var problems = new List<string>();
        if (metadata?.DefaultMenuMode is not { } mode)
        {
            return problems;
        }

        if (ShellOptions.Normalize(mode) is null)
        {
            problems.Add($"{owner} declares default menu mode '{mode}', which is not one of {string.Join(", ", ShellOptions.NavigationModes.Select(candidate => char.ToLowerInvariant(candidate.Id.ToString()[0]) + candidate.Id.ToString()[1..]))}");
        }

        if (string.IsNullOrWhiteSpace(metadata.DisplayName ?? displayName))
        {
            problems.Add($"{owner} is offered as a shell card but declares no title");
        }

        if (string.IsNullOrWhiteSpace(metadata.Description ?? description))
        {
            problems.Add($"{owner} is offered as a shell card but declares no description");
        }

        problems.AddRange(ThumbnailProblems(owner, metadata.Thumbnail, files));
        return problems;
    }

    static List<string> PlacementProblems(BlueprintSource source, IReadOnlyList<TemplateSource> library, string label, bool domain)
    {
        var own = (source.ScreenTemplates ?? []).Where(template => template.FitsSlot is not null).ToList();
        if (own.Count == 0)
        {
            return [];
        }

        var layouts = (source.Layouts ?? []).Concat(library.SelectMany(other => other.Layouts ?? [])).ToList();
        var everyTemplate = (source.ScreenTemplates ?? []).Concat(library.SelectMany(other => other.ScreenTemplates ?? [])).ToList();
        if (layouts.Count == 0)
        {
            return [$"{label} has no layout to place its screen templates in"];
        }

        var resolutions = layouts.ConvertAll(layout => ScreenTemplateResolver.Resolve(layout, everyTemplate));
        var problems = new List<string>();

        foreach (var template in own)
        {
            if (resolutions.Exists(resolution => resolution.Placements.Any(placement => placement.Template == template.Name)))
            {
                continue;
            }

            var unplaced = resolutions.SelectMany(resolution => resolution.Unplaced.Where(candidate => candidate.Template == template.Name)).ToList().Find(candidate => candidate.Candidates.Count > 1);
            if (resolutions.Exists(resolution => resolution.Cycles.Any(cycle => cycle.Contains(template.Name))))
            {
                problems.Add($"Template '{template.Name}' is nested inside itself");
            }
            else if (unplaced is not null && domain)
            {
                problems.Add($"Template '{template.Name}' is ambiguous: slot '{unplaced.Slot}' is declared by {string.Join(", ", unplaced.Candidates)}");
            }
            else if (unplaced is null)
            {
                problems.Add($"Template '{template.Name}' is unplaced: no layout or template declares slot '{template.FitsSlot}'");
            }
        }

        return problems;
    }
}
