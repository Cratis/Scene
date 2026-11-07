// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Placement;

/// <summary>
/// What opening a slice in a routed slot adds to the route: the slot's route parameters, then the slice's segment. Placement
/// reports the parts, not a path; a renderer turns them into the URL (ADR-004), such as <c language="csharp">…/NK-101/set-product-price</c>.
/// </summary>
/// <param name="Slot">The routed slot.</param>
/// <param name="Parameters">The slot's route parameters, in order.</param>
/// <param name="Segment">The slice's route segment after them, such as <c language="csharp">set-product-price</c>.</param>
public record PlacementRoute(string Slot, IReadOnlyList<PlacementRouteParameter> Parameters, string Segment);
