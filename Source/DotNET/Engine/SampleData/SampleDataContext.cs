// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Profiles;
using Cratis.Scene.Model.SampleData;

namespace Cratis.Scene.Engine.SampleData;

/// <summary>
/// What the host knows when it asks for sample data.
/// </summary>
/// <param name="Packs">Every pack available: blueprint packs and the author's own.</param>
/// <param name="Profile">
/// The application's UI profile, whose <c language="csharp">SampleData</c> is the one place the active pack is chosen (plus the rare mappings
/// and bindings). Null, or a profile without sample data, behaves as no active pack, no mappings and no bindings.
/// </param>
/// <param name="SessionActivePack">
/// A session-only override of the profile's active pack, as the preview strip's selector sets it: a pack id replaces the profile's
/// active pack, the empty string (the generated entry's id) means no active pack, and null leaves the profile's choice. It is never a
/// second source of truth: it is not stored, and bindings and mappings still come from the profile.
/// </param>
/// <param name="BlueprintDefaultPack">The default pack of the blueprint the template came from.</param>
/// <param name="Locale">The locale of generated data when no pack supplies one; defaults to en-GB.</param>
/// <param name="Seed">The seed for generated data; defaults to 1 so previews are stable.</param>
/// <param name="RowCount">The number of generated rows; defaults to 5.</param>
/// <param name="IsDesignOrPreview">
/// Whether the host is design time or preview. Sample data resolves only when this is true; a Stage production build leaves it
/// false (the default) and gets nothing.
/// </param>
public record SampleDataContext(
    IReadOnlyList<SampleDataPack> Packs,
    UiProfile? Profile = null,
    string? SessionActivePack = null,
    string? BlueprintDefaultPack = null,
    string? Locale = null,
    long? Seed = null,
    int? RowCount = null,
    bool IsDesignOrPreview = false);
