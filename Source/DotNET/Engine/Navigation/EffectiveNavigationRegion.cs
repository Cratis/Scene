// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Navigation;
using Cratis.Scene.Model.Outlets;

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// The items an outlet of navigation - a region such as the sidebar, or a contribution point such as <c language="csharp">Navigation</c> -
/// effectively shows for the application or for one module, with where they came from.
/// </summary>
/// <param name="Region">The name of the outlet of navigation: a <see cref="NavigationRegionKind"/>'s outlet for a shell region, or a contribution point's name.</param>
/// <param name="Sources">Where the items come from, as the region tag shows it.</param>
/// <param name="Items">The items in the order they are shown.</param>
/// <param name="Module">The module the outlet is resolved for; <see langword="null"/> for the application itself.</param>
/// <param name="Mode">How the module treats the outlet: <see langword="null"/> at the application level, which is the base.</param>
/// <param name="Buttons">The buttons the outlet's outlet of actions (<c language="csharp">&lt;outlet&gt;Buttons</c>) effectively shows, in the order they are shown.</param>
public record EffectiveNavigationRegion(
    string Region,
    NavigationSources Sources,
    IReadOnlyList<EffectiveNavItem> Items,
    string? Module = null,
    OutletMode? Mode = null,
    IReadOnlyList<EffectiveNavButton>? Buttons = null);
