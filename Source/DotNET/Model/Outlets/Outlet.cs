// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// A list of items a layout or template offers, with its default items: Screenplay's
/// <c language="screenplay">outlet &lt;name&gt; of actions|filters|tabs|stats|navigation [for item|screen] [in &lt;slot&gt;]</c>. Lower levels inherit,
/// extend or override it (<see cref="OutletRefinement"/>) and any level can contribute to it (<see cref="OutletContribution"/>).
/// An outlet is not a slot: a slot is a region content is placed in, an outlet is a list of items.
/// </summary>
/// <param name="Name">The name lower levels and contributions use, such as <c language="screenplay">toolbar</c> or <c language="screenplay">rowActions</c>.</param>
/// <param name="Kind">What the outlet lists.</param>
/// <param name="Defaults">The default items, in order.</param>
/// <param name="Subject">What the outlet's actions act on; only an outlet of actions has one.</param>
/// <param name="Slot">The slot the outlet owns; an outlet of tabs shows the chosen tab's screen there.</param>
public record Outlet(string Name, OutletKind Kind, IReadOnlyList<OutletItem> Defaults, OutletSubject? Subject = null, string? Slot = null);
