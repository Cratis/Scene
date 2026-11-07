// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// How a lower level - a module, a feature, a slice or a screen - treats an outlet it inherits: Screenplay's
/// <c language="screenplay">outlet &lt;name&gt; inherits|extends|overrides</c> with <c language="screenplay">hide &lt;id&gt;</c> and its own items.
/// </summary>
/// <param name="Outlet">The name of the outlet refined.</param>
/// <param name="Mode">How the inherited items are treated; extends when the refinement has items or hides, otherwise inherits.</param>
/// <param name="Items">This level's own items, in order. They go after the inherited ones unless they say before or after.</param>
/// <param name="Hide">The ids of inherited items this level hides.</param>
public record OutletRefinement(string Outlet, OutletMode? Mode = null, IReadOnlyList<OutletItem>? Items = null, IReadOnlyList<string>? Hide = null);
