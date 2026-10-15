// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Templates;
using Cratis.Scene.Model.Packages;

namespace Cratis.Scene.Engine.Blueprints;

/// <summary>
/// Describes every domain blueprint among the given packages - those of kind Blueprint that declare blueprint metadata - for a gallery: its
/// thumbnail and description, its screen set in navigation order, the templates it provides, and the sample data a preview can use. A package
/// that only provides foundation layouts and templates is not a domain blueprint and is not listed. Returns the same entries, in the same
/// order, as the TypeScript engine (<c language="csharp">describeBlueprintCatalog</c>).
/// </summary>
public static class BlueprintCatalog
{
    /// <summary>
    /// Describes the domain blueprints.
    /// </summary>
    /// <param name="sources">The packages and the templates they provide.</param>
    /// <returns>One entry per domain blueprint, ordered by package name.</returns>
    public static IReadOnlyList<BlueprintCatalogEntry> Describe(IReadOnlyList<TemplateSource> sources) =>
        [.. sources
            .Where(source => source.Manifest.Kind == PackageKind.Blueprint && source.Manifest.Blueprint is not null)
            .Select(DescribeOne)
            .OrderBy(entry => entry.Package, StringComparer.Ordinal)];

    static BlueprintCatalogEntry DescribeOne(TemplateSource source)
    {
        var manifest = source.Manifest;
        var blueprint = manifest.Blueprint!;
        var references = manifest.SampleData ?? [];
        var defaultId = blueprint.DefaultSampleData ?? (references.Count == 1 ? references[0].Id : null);

        var templates = (source.Layouts ?? []).Select(layout => new BlueprintCatalogTemplate(layout.Name, nameof(TemplateCatalogKind.Layout), null, null, layout.Metadata?.Type, layout.Metadata?.Category, layout.Metadata?.Thumbnail))
            .Concat((source.ScreenTemplates ?? []).Select(template => new BlueprintCatalogTemplate(template.Name, nameof(TemplateCatalogKind.ScreenTemplate), template.DisplayName, template.Description, template.Metadata?.Type, template.Metadata?.Category, template.Metadata?.Thumbnail)))
            .Concat((source.DialogTemplates ?? []).Select(template => new BlueprintCatalogTemplate(template.Name, nameof(TemplateCatalogKind.DialogTemplate), template.DisplayName, template.Description, template.Metadata?.Type, template.Metadata?.Category, template.Metadata?.Thumbnail)));

        return new(
            manifest.Name,
            manifest.Version,
            blueprint.Domain,
            manifest.DisplayName,
            blueprint.Description,
            blueprint.Thumbnail,
            manifest.License,
            manifest.LicenseUrl,
            [.. manifest.Dependencies.Select(dependency => new BlueprintCatalogDependency(dependency.Name, dependency.VersionRange))],
            [.. Ordered(blueprint.ScreenSet ?? []).Select(screen => new BlueprintCatalogScreen(screen.Name, screen.Title, screen.Description, screen.Template, screen.Parent, screen.Order))],
            [.. templates],
            [.. references.Select(reference => new BlueprintCatalogSampleData(reference.Id, reference.Title, reference.Locale, reference.Path, reference.Id == defaultId))]);
    }

    /// <summary>
    /// Puts screens in navigation order: siblings by order (a screen without one keeps its written place after those with one), each screen
    /// directly followed by its children, so a flat list reads top to bottom as the navigation does.
    /// </summary>
    /// <param name="screens">The screens as written.</param>
    /// <returns>The screens in navigation order.</returns>
    static List<BlueprintScreen> Ordered(IReadOnlyList<BlueprintScreen> screens)
    {
        var names = screens.Select(screen => screen.Name).ToHashSet(StringComparer.Ordinal);

        List<BlueprintScreen> ChildrenOf(string? parent) =>
            [.. screens
                .Where(screen => parent is null ? screen.Parent is null || !names.Contains(screen.Parent) : screen.Parent == parent)
                .Select((screen, index) => (Screen: screen, Index: index))
                .OrderBy(entry => entry.Screen.Order ?? int.MaxValue)
                .ThenBy(entry => entry.Index)
                .Select(entry => entry.Screen)];

        var result = new List<BlueprintScreen>();
        var seen = new HashSet<string>(StringComparer.Ordinal);

        void Walk(List<BlueprintScreen> level)
        {
            foreach (var screen in level)
            {
                if (!seen.Add(screen.Name))
                {
                    continue;
                }

                result.Add(screen);
                Walk(ChildrenOf(screen.Name));
            }
        }

        Walk(ChildrenOf(null));
        result.AddRange(screens.Where(screen => !seen.Contains(screen.Name)));
        return result;
    }
}
