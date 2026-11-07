// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Navigation;
using Cratis.Scene.Model.Outlets;

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// One change to a navigation model's outlets. An edit helper returns the edits that carry out a user's gesture - for example
/// adding an item to an outlet a module inherits is a switch to extends and then the add - so every host that offers the gesture
/// makes the same change.
/// </summary>
/// <param name="Kind">What the edit does.</param>
/// <param name="Module">The module the edit is for; <see langword="null"/> for the application level.</param>
/// <param name="Outlet">The outlet the edit changes, such as <c language="csharp">sidebar</c> or <c language="csharp">topbarButtons</c>.</param>
/// <param name="Mode">For <see cref="NavigationEditKind.SetOutletMode"/>: the new mode.</param>
/// <param name="Items">For <see cref="NavigationEditKind.SetOutletItems"/>: the items the level puts in the outlet afterwards.</param>
/// <param name="Id">For update, move, remove and hide: the id of the item.</param>
/// <param name="Parent">For add and move: the id of the item it becomes a sub-item of; <see langword="null"/> for a top-level item.</param>
/// <param name="Index">For add and move: the position among its siblings; after the ones already there when <see langword="null"/>.</param>
/// <param name="Item">For add: the item to add; for update: the item as it becomes.</param>
/// <param name="Logo">For <see cref="NavigationEditKind.SetLogo"/>: the application logo.</param>
public record NavigationEdit(
    NavigationEditKind Kind,
    string? Module = null,
    string? Outlet = null,
    OutletMode? Mode = null,
    IReadOnlyList<OutletItem>? Items = null,
    string? Id = null,
    string? Parent = null,
    int? Index = null,
    OutletItem? Item = null,
    ApplicationLogo? Logo = null);
