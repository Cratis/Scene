// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Navigation;

/// <summary>
/// The items one level (the application or a module) defines for one navigation region.
/// </summary>
/// <param name="Region">Which region the items belong to.</param>
/// <param name="Items">The items, in order.</param>
/// <param name="Mode">How a module's items relate to the application's; absent at the application level, which is the base, and meaning <see cref="NavigationRegionMode.Inherit"/> at a module.</param>
public record NavigationRegion(NavigationRegionKind Region, IReadOnlyList<NavItem> Items, NavigationRegionMode? Mode = null);
