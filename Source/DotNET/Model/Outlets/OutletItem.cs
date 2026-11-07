// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// One item of an outlet, told apart by the <c language="json">kind</c> it carries when stored.
/// </summary>
[JsonPolymorphic(TypeDiscriminatorPropertyName = "kind")]
[JsonDerivedType(typeof(OutletButton), "button")]
[JsonDerivedType(typeof(OutletMenuEntry), "menuEntry")]
[JsonDerivedType(typeof(OutletSeparator), "separator")]
[JsonDerivedType(typeof(OutletGroup), "group")]
[JsonDerivedType(typeof(OutletFilter), "filter")]
[JsonDerivedType(typeof(OutletTab), "tab")]
[JsonDerivedType(typeof(OutletStat), "stat")]
[JsonDerivedType(typeof(OutletNavigationItem), "navigation")]
public abstract record OutletItem
{
    /// <summary>
    /// Gets the kind of item; it decides which outlets take it. It is the stored <c language="json">kind</c>.
    /// </summary>
    [JsonIgnore]
    public abstract OutletItemKind Kind { get; }

    /// <summary>
    /// Gets the identity of the item within its outlet; hide, before and after name it.
    /// </summary>
    public required string Id { get; init; }

    /// <summary>
    /// Gets the id of an item this one goes right before, Screenplay's <c language="screenplay">before &lt;id&gt;</c>.
    /// </summary>
    public string? Before { get; init; }

    /// <summary>
    /// Gets the id of an item this one goes right after, Screenplay's <c language="screenplay">after &lt;id&gt;</c>.
    /// </summary>
    public string? After { get; init; }
}
