// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

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
public record SampleDataCatalogEntry(string Id, bool IsGenerated, string Name, string Label, bool Selected, string? Locale = null);
