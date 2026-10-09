// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Packages;
using Cratis.Scene.Model.Packages;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Templates;

/// <summary>
/// Describes every template a set of packages provides, with its compatibility, attribution and license metadata
/// and whether it can be used. The TypeScript engine (<c language="csharp">describeTemplateCatalog</c>) produces the same entries.
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
                var problems = TemplateMetadataValidation.Validate(name, metadata).Concat(RequirementProblems(name, metadata, source.Manifest, versions, sceneVersion)).ToList();
                entries.Add(new(source.Manifest.Name, source.Manifest.Version, kind, name, displayName, description, metadata, problems.Count == 0, problems));
            }
        }

        return entries;
    }

    static List<string> RequirementProblems(string name, TemplateMetadata? metadata, ScenePackage owner, Dictionary<string, string> versions, string? sceneVersion)
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
            if (requirement.Name != owner.Name && !owner.Dependencies.Any(dependency => dependency.Name == requirement.Name))
            {
                problems.Add($"Template '{name}' requires package '{requirement.Name}', which its package '{owner.Name}' does not depend on");
            }

            if (!versions.TryGetValue(requirement.Name, out var version))
            {
                problems.Add($"Template '{name}' requires package '{requirement.Name}', which is not available");
            }
            else if (!PackageVersionRange.IsSatisfiedBy(version, requirement.VersionRange))
            {
                problems.Add($"Template '{name}' requires package '{requirement.Name}' {requirement.VersionRange} but version {version} is available");
            }
        }

        return problems;
    }
}
