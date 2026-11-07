// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// A tab of an outlet of tabs: Screenplay's <c language="screenplay">tab &lt;id&gt; title "…" shows &lt;screen&gt;</c>. The screen shows in the slot the outlet owns.
/// </summary>
public record OutletTab : OutletItem
{
    /// <inheritdoc/>
    [JsonIgnore]
    public override OutletItemKind Kind => OutletItemKind.Tab;

    /// <summary>Gets the label of the tab.</summary>
    public required string Title { get; init; }

    /// <summary>Gets the qualified name of the screen the tab shows.</summary>
    public required string Shows { get; init; }
}
