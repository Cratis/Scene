// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

namespace Cratis.Scene.Model.SampleData;

/// <summary>
/// How a <see cref="Packages.ScenePackage"/> declares a sample-data pack it ships: the pack's identity, enough
/// to list it in a selector without loading it, and where its JSON file lives.
/// </summary>
/// <param name="Id">The pack's identity; must equal the id inside the file.</param>
/// <param name="Title">The display name shown in a selector.</param>
/// <param name="Locale">The BCP 47 locale tag of the pack's data.</param>
/// <param name="Path">The package-relative path of the pack file, under <c language="csharp">sampleData/</c> and ending in <c language="csharp">.json</c>.</param>
/// <param name="Description">One line saying what the pack is, shown under its name in a selector.</param>
/// <param name="Columns">The names of the pack's main table's columns, in the order a preview shows them.</param>
/// <param name="StatusColumn">The column whose values are drawn as status pills.</param>
/// <param name="Statuses">Which values of the status column are good, pending, bad or neutral; any other value is neutral.</param>
[method: JsonConstructor]
public record SampleDataPackReference(
    string Id,
    string Title,
    string Locale,
    string Path,
    string? Description = null,
    IReadOnlyList<string>? Columns = null,
    string? StatusColumn = null,
    SampleStatusClassification? Statuses = null)
{
    /// <summary>
    /// Initializes a new instance of the <see cref="SampleDataPackReference"/> record with the members it had before the description, columns and statuses.
    /// Kept so a package compiled against an earlier version still finds the constructor it was built with.
    /// </summary>
    /// <param name="id">The pack identity.</param>
    /// <param name="title">The title.</param>
    /// <param name="locale">The locale tag.</param>
    /// <param name="path">The package-relative path of the pack.</param>
    public SampleDataPackReference(string id, string title, string locale, string path)
        : this(id, title, locale, path, null, null, null, null)
    {
    }
}
