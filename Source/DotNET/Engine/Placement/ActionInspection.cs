// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Outlets;

namespace Cratis.Scene.Engine.Placement;

/// <summary>
/// One action as an editor sees it: where it comes from, where its slice opens, and whether it can be used - each with
/// the reason.
/// </summary>
/// <param name="Id">The id of the outlet item or element.</param>
/// <param name="Title">The text the action shows.</param>
/// <param name="Enablement">Whether the action can be used, and why.</param>
/// <param name="Group">The id of the group the action sits in, when it sits in one.</param>
/// <param name="Provenance">Where the action comes from in the outlet's chain; <see langword="null"/> for an element.</param>
/// <param name="Editable">Whether the level the outlet is resolved for put the action there; <see langword="null"/> for an element.</param>
/// <param name="Slice">The slice the action runs, when it runs one the context knows.</param>
/// <param name="Placement">Where the slice opens and why; <see langword="null"/> when the action runs no slice the context knows.</param>
public record ActionInspection(
    string Id,
    string Title,
    Enablement Enablement,
    string? Group = null,
    OutletProvenance? Provenance = null,
    bool? Editable = null,
    string? Slice = null,
    PlacementDecision? Placement = null);
