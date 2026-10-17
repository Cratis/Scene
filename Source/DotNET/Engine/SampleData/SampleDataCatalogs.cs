// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Packages;
using Cratis.Scene.Model.SampleData;

namespace Cratis.Scene.Engine.SampleData;

/// <summary>
/// Describes the content of the sample data selector, the one used by the UI profile's sample data property editor and by the
/// preview strip's session override. Identical to the TypeScript engine's <c language="csharp">describeSampleDataCatalog</c>.
/// </summary>
public static class SampleDataCatalogs
{
    /// <summary>The separator between blueprint and pack in a label (<c language="csharp">CRM · Nordic SMB</c>).</summary>
    public const string LabelSeparator = " \u00b7 ";

    /// <summary>The name of the generated entry.</summary>
    public const string GeneratedName = "Generic (typed by field kind)";

    /// <summary>
    /// Describes the selector's content: the generated entry first, then the author's own packs, then each blueprint's packs grouped
    /// by the blueprint's display name (falling back to its package name). A pack whose title already starts with
    /// <c language="csharp">&lt;Blueprint&gt; · </c> shows the rest as its name. Same own-first, then Blueprints menu pattern as the template picker.
    /// </summary>
    /// <param name="sources">The packages and the packs they ship (only their references are listed).</param>
    /// <param name="ownPacks">The author's own packs.</param>
    /// <param name="activePack">The active pack id, if any.</param>
    /// <returns>The catalog.</returns>
    public static SampleDataCatalog Describe(
        IReadOnlyList<SampleDataPackSource> sources,
        IReadOnlyList<SampleDataPackReference>? ownPacks = null,
        string? activePack = null)
    {
        SampleDataCatalogEntry Entry(string id, string name, string label, string locale, SampleDataPackReference? reference = null) =>
            new(id, false, name, label, id == activePack, locale, reference?.Description, reference?.Columns, reference?.StatusColumn, reference?.Statuses);

        var blueprints = new List<SampleDataCatalogGroup>();
        foreach (var source in sources)
        {
            var references = source.Manifest.SampleData ?? [];
            if (references.Count == 0)
            {
                continue;
            }

            var group = GroupName(source.Manifest);
            var prefix = $"{group}{LabelSeparator}";
            blueprints.Add(new SampleDataCatalogGroup(
                group,
                [.. references.Select(reference =>
                {
                    var name = reference.Title.StartsWith(prefix, StringComparison.Ordinal) ? reference.Title[prefix.Length..] : reference.Title;
                    return Entry(reference.Id, name, $"{group}{LabelSeparator}{name}", reference.Locale, reference);
                })]));
        }

        return new SampleDataCatalog(
            new SampleDataCatalogEntry(string.Empty, true, GeneratedName, GeneratedName, string.IsNullOrEmpty(activePack), null, SampleStatuses.GenericDescription, SampleStatuses.GenericColumns, SampleStatuses.GenericStatusColumn, SampleStatuses.GenericStatuses),
            [.. (ownPacks ?? []).Select(pack => Entry(pack.Id, pack.Title, pack.Title, pack.Locale, pack))],
            blueprints,
            SampleDataValidation.ValidatePackages(sources));
    }

    static string GroupName(ScenePackage manifest) =>
        !string.IsNullOrWhiteSpace(manifest.DisplayName) ? manifest.DisplayName : manifest.Name;
}
