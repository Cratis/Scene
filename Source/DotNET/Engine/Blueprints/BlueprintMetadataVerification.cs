// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Packages;

namespace Cratis.Scene.Engine.Blueprints;

/// <summary>
/// The rules for the metadata of a domain blueprint: its domain, description, thumbnail, screen set, sample data and its dependency on the foundation set.
/// </summary>
static class BlueprintMetadataVerification
{
    /// <summary>
    /// Verifies the metadata of a domain blueprint.
    /// </summary>
    /// <param name="source">The blueprint.</param>
    /// <param name="label">How the blueprint is named in a problem.</param>
    /// <param name="availableTemplates">The names of the screen templates available to it.</param>
    /// <param name="foundation">The package that provides the foundation set.</param>
    /// <returns>The problems.</returns>
    internal static List<string> Problems(BlueprintSource source, string label, HashSet<string> availableTemplates, string foundation)
    {
        var blueprint = source.Manifest.Blueprint!;
        return
        [
            .. DomainProblems(label, blueprint),
            .. DescriptionProblems(label, blueprint),
            .. ThumbnailProblems(label, blueprint.Thumbnail, source.Files),
            .. BlueprintScreenSetVerification.Problems(source, label, availableTemplates),
            .. SampleDataDefaultProblems(label, blueprint, (source.Manifest.SampleData ?? []).Select(reference => reference.Id).ToList()),
            .. FoundationDependencyProblems(source.Manifest, label, foundation)
        ];
    }

    /// <summary>
    /// Verifies a thumbnail reference.
    /// </summary>
    /// <param name="owner">How the owner is named in a problem.</param>
    /// <param name="thumbnail">The thumbnail path, if any.</param>
    /// <param name="files">The files in the package, when known.</param>
    /// <returns>The problems.</returns>
    internal static List<string> ThumbnailProblems(string owner, string? thumbnail, IReadOnlyList<string>? files)
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

    /// <summary>
    /// Verifies that every sample data pack names a file in the package.
    /// </summary>
    /// <param name="source">The blueprint.</param>
    /// <param name="label">How the blueprint is named in a problem.</param>
    /// <returns>The problems.</returns>
    internal static List<string> SampleDataFileProblems(BlueprintSource source, string label)
    {
        var problems = new List<string>();
        foreach (var reference in source.Manifest.SampleData ?? [])
        {
            if (source.Files?.Contains(reference.Path) == false)
            {
                problems.Add($"{label} sample data pack '{reference.Id}' names '{reference.Path}', which is not in the package");
            }
        }

        return problems;
    }

    static List<string> DomainProblems(string label, BlueprintMetadata blueprint)
    {
        if (string.IsNullOrWhiteSpace(blueprint.Domain))
        {
            return [$"{label} declares no domain"];
        }

        return BlueprintRules.IsValidDomain(blueprint.Domain) ? [] : [$"{label} declares an invalid domain '{blueprint.Domain}'; use lower-case words separated by '-'"];
    }

    static List<string> DescriptionProblems(string label, BlueprintMetadata blueprint)
    {
        if (string.IsNullOrWhiteSpace(blueprint.Description))
        {
            return [$"{label} declares no description"];
        }

        return blueprint.Description.Length > BlueprintRules.MaximumDescriptionLength ? [$"{label} declares a description longer than {BlueprintRules.MaximumDescriptionLength} characters"] : [];
    }

    static List<string> SampleDataDefaultProblems(string label, BlueprintMetadata blueprint, List<string> referenceIds)
    {
        var problems = new List<string>();
        if (blueprint.DefaultSampleData is not null && !referenceIds.Contains(blueprint.DefaultSampleData))
        {
            problems.Add($"{label} declares default sample data '{blueprint.DefaultSampleData}', which is not one of its sample data packs");
        }

        if (referenceIds.Count == 0)
        {
            problems.Add($"{label} ships no sample data pack");
        }
        else if (referenceIds.Count > 1 && blueprint.DefaultSampleData is null)
        {
            problems.Add($"{label} ships several sample data packs but declares no default");
        }

        return problems;
    }

    static List<string> FoundationDependencyProblems(ScenePackage manifest, string label, string foundation) =>
        manifest.Name != foundation && !manifest.Dependencies.Any(dependency => dependency.Name == foundation)
            ? [$"{label} does not depend on the foundation set '{foundation}'"]
            : [];
}
