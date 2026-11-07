// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Layouts;

namespace Cratis.Scene.Engine.Placement;

/// <summary>
/// A slot of the page as an <c language="csharp">In a slot</c> choice: whether the slice can open there, and why.
/// </summary>
/// <param name="Name">The name of the slot.</param>
/// <param name="Role">The slot's role.</param>
/// <param name="Routed">Whether the slot is routed.</param>
/// <param name="Offered">Whether the slice can open in the slot.</param>
/// <param name="Reason">Why, such as <c language="csharp">pane, routed: opening here changes the URL</c>.</param>
/// <param name="Route">What opening the slice in the slot adds to the route, when the slot is routed and the slice can open there.</param>
public record SlotOption(string Name, SlotRole Role, bool Routed, bool Offered, string Reason, PlacementRoute? Route = null);
