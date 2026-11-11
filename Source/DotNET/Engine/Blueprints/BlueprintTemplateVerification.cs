// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Profiles;
using Cratis.Scene.Engine.Templates;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Blueprints;

/// <summary>
/// The rules for every template a blueprint provides: what the catalog reports, a display name and description, the shell card a default menu mode implies and, for a domain blueprint, a type, a business category and a thumbnail.
/// </summary>
static class BlueprintTemplateVerification
{
    /// <summary>
    /// Verifies the templates a blueprint provides.
    /// </summary>
    /// <param name="source">The blueprint.</param>
    /// <param name="library">The other packages available.</param>
    /// <param name="domain">Whether the blueprint is a domain blueprint.</param>
    /// <returns>The problems.</returns>
    internal static List<string> Problems(BlueprintSource source, IReadOnlyList<TemplateSource> library, bool domain)
    {
        var problems = CatalogProblems(source, library);
        foreach (var entry in EveryTemplate(source))
        {
            var owner = $"Template '{entry.Name}'";
            if (entry.Describable)
            {
                problems.AddRange(DescribedTemplateProblems(owner, entry));
            }

            problems.AddRange(ShellCardProblems(owner, entry, source.Files));

            if (domain)
            {
                problems.AddRange(DomainTemplateProblems(owner, entry.Metadata, source.Files));
            }
        }

        return problems;
    }

    static IEnumerable<TemplateEntry> EveryTemplate(BlueprintSource source) =>
        (source.Layouts ?? []).Select(layout => new TemplateEntry(layout.Name, null, null, layout.Metadata, false))
            .Concat((source.ScreenTemplates ?? []).Select(template => new TemplateEntry(template.Name, template.DisplayName, template.Description, template.Metadata, true)))
            .Concat((source.DialogTemplates ?? []).Select(template => new TemplateEntry(template.Name, template.DisplayName, template.Description, template.Metadata, true)));

    static List<string> CatalogProblems(BlueprintSource source, IReadOnlyList<TemplateSource> library)
    {
        var problems = new List<string>();
        var others = library.Where(other => other.Manifest.Name != source.Manifest.Name);
        foreach (var entry in TemplateCatalog.Describe([source.AsTemplateSource(), .. others]).Where(candidate => candidate.Package == source.Manifest.Name))
        {
            problems.AddRange(entry.Problems);
        }

        return problems;
    }

    static List<string> DescribedTemplateProblems(string owner, TemplateEntry entry)
    {
        var problems = new List<string>();
        if (string.IsNullOrWhiteSpace(entry.DisplayName))
        {
            problems.Add($"{owner} declares no display name");
        }

        if (string.IsNullOrWhiteSpace(entry.Description))
        {
            problems.Add($"{owner} declares no description");
        }

        return problems;
    }

    static List<string> DomainTemplateProblems(string owner, TemplateMetadata? metadata, IReadOnlyList<string>? files)
    {
        var problems = TypeProblems(owner, metadata);
        problems.AddRange(CategoryProblems(owner, metadata));
        problems.AddRange(BlueprintMetadataVerification.ThumbnailProblems(owner, metadata?.Thumbnail, files));
        return problems;
    }

    static List<string> TypeProblems(string owner, TemplateMetadata? metadata)
    {
        if (metadata?.Type is null)
        {
            return [$"{owner} declares no type"];
        }

        return BlueprintRules.TemplateTypes.Contains(metadata.Type) ? [] : [$"{owner} declares type '{metadata.Type}', which is not one of {string.Join(", ", BlueprintRules.TemplateTypes)}"];
    }

    static List<string> CategoryProblems(string owner, TemplateMetadata? metadata) =>
        metadata?.Category is { } category && IsOutsideBusinessCategories(category)
            ? [$"{owner} declares category '{category}', which does not start with '{BlueprintRules.BusinessCategoryPrefix}'"]
            : [];

    static bool IsOutsideBusinessCategories(string category) =>
        category.Trim().Length > 0 && !category.StartsWith(BlueprintRules.BusinessCategoryPrefix, StringComparison.Ordinal);

    static List<string> ShellCardProblems(string owner, TemplateEntry entry, IReadOnlyList<string>? files)
    {
        var problems = new List<string>();
        if (entry.Metadata?.DefaultMenuMode is not { } mode)
        {
            return problems;
        }

        var metadata = entry.Metadata;
        if (ShellOptions.Normalize(mode) is null)
        {
            problems.Add($"{owner} declares default menu mode '{mode}', which is not one of {string.Join(", ", ShellOptions.NavigationModes.Select(candidate => char.ToLowerInvariant(candidate.Id.ToString()[0]) + candidate.Id.ToString()[1..]))}");
        }

        if (string.IsNullOrWhiteSpace(metadata.DisplayName ?? entry.DisplayName))
        {
            problems.Add($"{owner} is offered as a shell card but declares no title");
        }

        if (string.IsNullOrWhiteSpace(metadata.Description ?? entry.Description))
        {
            problems.Add($"{owner} is offered as a shell card but declares no description");
        }

        problems.AddRange(BlueprintMetadataVerification.ThumbnailProblems(owner, metadata.Thumbnail, files));
        return problems;
    }

    sealed record TemplateEntry(string Name, string? DisplayName, string? Description, TemplateMetadata? Metadata, bool Describable);
}
