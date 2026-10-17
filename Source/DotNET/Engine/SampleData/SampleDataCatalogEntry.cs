// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

namespace Cratis.Scene.Engine.SampleData;

/// <summary>
/// One entry of the sample data selector.
/// </summary>
/// <param name="Id">The pack identity a selection stores as its active pack; empty for the generated entry.</param>
/// <param name="IsGenerated">Whether this is the generated entry, the choice that stores no active pack.</param>
/// <param name="Name">The pack's name within its group (<c language="csharp">Nordic SMB</c>).</param>
/// <param name="Label">The full label (<c language="csharp">CRM · Nordic SMB</c>, or just the name for generated and own packs).</param>
/// <param name="Selected">Whether it is the active pack (the generated entry is selected when no pack is active).</param>
/// <param name="Locale">The locale tag, null for the generated entry.</param>
/// <param name="Description">One line saying what the pack is.</param>
/// <param name="Columns">The columns of the pack's main table, in order.</param>
/// <param name="StatusColumn">The column drawn as status pills.</param>
/// <param name="Statuses">The classification of the status column's values.</param>
[method: JsonConstructor]
public record SampleDataCatalogEntry(
    string Id,
    bool IsGenerated,
    string Name,
    string Label,
    bool Selected,
    string? Locale = null,
    string? Description = null,
    IReadOnlyList<string>? Columns = null,
    string? StatusColumn = null,
    Cratis.Scene.Model.SampleData.SampleStatusClassification? Statuses = null)
{
    /// <summary>
    /// Initializes a new instance of the <see cref="SampleDataCatalogEntry"/> record with the members it had before the description, columns and statuses.
    /// Kept so a package compiled against an earlier version still finds the constructor it was built with.
    /// </summary>
    /// <param name="id">The pack identity.</param>
    /// <param name="isGenerated">Whether this is the generated entry.</param>
    /// <param name="name">The pack's name within its group.</param>
    /// <param name="label">The full label.</param>
    /// <param name="selected">Whether it is the active pack.</param>
    /// <param name="locale">The locale tag.</param>
    public SampleDataCatalogEntry(string id, bool isGenerated, string name, string label, bool selected, string? locale)
        : this(id, isGenerated, name, label, selected, locale, null, null, null, null)
    {
    }
}
