// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;
using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// An item of an outlet of navigation: Screenplay's <c language="screenplay">item &lt;id&gt; title "…" target &lt;Module&gt;.&lt;Feature&gt;</c>.
/// A sub-item is written with its <c language="json">kind</c> too, the way the TypeScript model writes it.
/// </summary>
[JsonPolymorphic(TypeDiscriminatorPropertyName = "kind")]
[JsonDerivedType(typeof(OutletNavigationItem), "navigation")]
public record OutletNavigationItem : OutletItem
{
    /// <inheritdoc/>
    [JsonIgnore]
    public override OutletItemKind Kind => OutletItemKind.Navigation;

    /// <summary>Gets the text shown.</summary>
    public required string Title { get; init; }

    /// <summary>Gets the qualified icon reference, when the item has one.</summary>
    public string? Icon { get; init; }

    /// <summary>Gets the module, feature or screen the item opens.</summary>
    public DestinationReference? Target { get; init; }

    /// <summary>Gets the slot the target opens in; the primary slot when absent.</summary>
    public string? Slot { get; init; }

    /// <summary>Gets the sub-items, in order.</summary>
    public IReadOnlyList<OutletNavigationItem>? Children { get; init; }
}
