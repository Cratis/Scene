// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// Items a module or feature adds to an outlet without overriding it: Screenplay's <c language="screenplay">contribute to &lt;outlet&gt;</c>.
/// Any level can contribute, including one outside the chain of the screen the outlet shows on.
/// </summary>
/// <param name="Outlet">The name of the outlet contributed to.</param>
/// <param name="Items">The contributed items, in order. They go last unless they say before or after.</param>
public record OutletContribution(string Outlet, IReadOnlyList<OutletItem> Items);
