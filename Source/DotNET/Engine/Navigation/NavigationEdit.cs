// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Navigation;

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// One change to a <see cref="NavigationModel"/>. An edit helper returns the edits that carry out a user's gesture - for example adding an
/// item to an inheriting region is a switch to extend and then the add - so every host that offers the gesture makes the same change.
/// </summary>
/// <param name="Kind">What the edit does.</param>
/// <param name="Module">The module the edit is for; <see langword="null"/> for the application level.</param>
/// <param name="Region">The region the edit changes.</param>
/// <param name="Mode">For <see cref="NavigationEditKind.SetRegionMode"/>: the new mode.</param>
/// <param name="Items">For <see cref="NavigationEditKind.SetRegionItems"/>: the items the level's region holds afterwards.</param>
/// <param name="Parent">For <see cref="NavigationEditKind.AddItem"/>: the id of the item the new item becomes a sub-item of; <see langword="null"/> for a top-level item.</param>
/// <param name="Item">For <see cref="NavigationEditKind.AddItem"/>: the item to add, after the items already there.</param>
/// <param name="Logo">For <see cref="NavigationEditKind.SetLogo"/>: the application logo.</param>
public record NavigationEdit(
    NavigationEditKind Kind,
    string? Module = null,
    NavigationRegionKind? Region = null,
    NavigationRegionMode? Mode = null,
    IReadOnlyList<NavItem>? Items = null,
    string? Parent = null,
    NavItem? Item = null,
    ApplicationLogo? Logo = null);
