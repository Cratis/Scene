// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Packages;
using Cratis.Scene.Model.Packages;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Templates;

/// <summary>
/// Describes every template a set of packages provides, with its compatibility, attribution and license metadata
/// and whether it can be used. A blueprint template without a category is a problem; an own template without one is a warning. The TypeScript engine (<c language="csharp">describeTemplateCatalog</c>) produces the same entries.
/// </summary>
public static class TemplateCatalog
{
    /// <summary>
    /// Describes the templates in package, then layout, screen template, dialog template order. Nothing is filtered
    /// out: an incompatible template is described with its problems.
    /// </summary>
    /// <param name="sources">The packages and the templates they provide.</param>
    /// <param name="sceneVersion">The Scene version the host runs, or <see langword="null"/> when not checked.</param>
    /// <returns>One entry per template.</returns>
    public static IReadOnlyList<TemplateCatalogEntry> Describe(IReadOnlyList<TemplateSource> sources, string? sceneVersion = null)
    {
        var versions = sources.GroupBy(source => source.Manifest.Name, StringComparer.Ordinal).ToDictionary(group => group.Key, group => group.Last().Manifest.Version, StringComparer.Ordinal);
        var entries = new List<TemplateCatalogEntry>();

        foreach (var source in sources)
        {
            var templates = (source.Layouts ?? []).Select(layout => (Kind: TemplateCatalogKind.Layout, layout.Name, DisplayName: (string?)null, Description: (string?)null, layout.Metadata))
                .Concat((source.ScreenTemplates ?? []).Select(template => (Kind: TemplateCatalogKind.ScreenTemplate, template.Name, template.DisplayName, template.Description, template.Metadata)))
                .Concat((source.DialogTemplates ?? []).Select(template => (Kind: TemplateCatalogKind.DialogTemplate, template.Name, template.DisplayName, template.Description, template.Metadata)));

            foreach (var (kind, name, displayName, description, metadata) in templates)
            {
                var problems = TemplateMetadataValidation.Validate(name, metadata).ToList();
                var warnings = new List<string>();
                if (TemplateMetadataValidation.ValidateCategory(name, metadata) is { } missingCategory)
                {
                    (source.Manifest.Kind == PackageKind.Blueprint ? problems : warnings).Add(missingCategory);
                }

                problems.AddRange(RequirementProblems(name, metadata, versions, sceneVersion));
                entries.Add(new(source.Manifest.Name, source.Manifest.Version, kind, name, displayName, description, metadata, problems.Count == 0, problems, warnings));
            }
        }

        return entries;
    }

    static List<string> RequirementProblems(string name, TemplateMetadata? metadata, Dictionary<string, string> versions, string? sceneVersion)
    {
        var problems = new List<string>();
        var compatibility = metadata?.Compatibility;
        if (compatibility is null) return problems;

        if (sceneVersion is not null && !string.IsNullOrWhiteSpace(compatibility.Scene) && !PackageVersionRange.IsSatisfiedBy(sceneVersion, compatibility.Scene))
        {
            problems.Add($"Template '{name}' requires Scene {compatibility.Scene} but the host runs {sceneVersion}");
        }

        foreach (var requirement in (compatibility.Packages ?? []).Where(requirement => !string.IsNullOrWhiteSpace(requirement.Name)))
        {
            // A template may require a package its owner does not depend on: that requirement is opt-in, and the template is
            // available only while the host or profile provides the package. The checks below make it unavailable otherwise.
            if (!versions.TryGetValue(requirement.Name, out var version))
            {
                problems.Add($"Template '{name}' requires package '{requirement.Name}', which this profile does not include. Add `packages {requirement.Name}` to the ui profile, or use a template that does not need it.");
            }
            else if (!PackageVersionRange.IsSatisfiedBy(version, requirement.VersionRange))
            {
                problems.Add($"Template '{name}' requires package '{requirement.Name}' {requirement.VersionRange} but version {version} is available");
            }
        }

        return problems;
    }
}
