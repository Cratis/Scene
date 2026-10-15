// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Navigation;

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// The items a region effectively shows for the application or for one module, with where they came from.
/// </summary>
/// <param name="Region">Which region this is.</param>
/// <param name="Sources">Where the items come from, as the region tag shows it.</param>
/// <param name="Items">The items in the order they are shown.</param>
/// <param name="Module">The module the region is resolved for; <see langword="null"/> for the application itself.</param>
/// <param name="Mode">The effective mode: <see langword="null"/> at the application level, which is the base.</param>
public record EffectiveNavigationRegion(
    NavigationRegionKind Region,
    NavigationSources Sources,
    IReadOnlyList<EffectiveNavItem> Items,
    string? Module = null,
    NavigationRegionMode? Mode = null);
