// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Outlets;

namespace Cratis.Scene.Engine.Outlets;

/// <summary>
/// An outlet resolved for the last level of a chain: its items in order with where each comes from, the inherited items the
/// chain hid or overrode, and a summary such as "Catalog + Products".
/// </summary>
/// <param name="Name">The name of the outlet.</param>
/// <param name="Items">The items, in order.</param>
/// <param name="Removed">The inherited items that are hidden or overridden, in the order they were removed.</param>
/// <param name="Sources">The names of the levels that shaped the outlet, in order: the declaring level, then each level that extended, overrode or contributed.</param>
/// <param name="Summary">The sources joined for a region tag, such as <c language="screenplay">Catalog + Products</c>.</param>
/// <param name="Diagnostics">What is wrong with the outlet along the chain.</param>
/// <param name="Kind">What the outlet lists; <see langword="null"/> when no level declares it.</param>
/// <param name="Subject">What the outlet's actions act on, when it has a subject.</param>
/// <param name="Slot">The slot the outlet owns, when it owns one.</param>
/// <param name="DeclaredBy">The name of the level that declares the outlet; <see langword="null"/> when none does.</param>
/// <param name="Mode">How the last level treats the outlet; <see langword="null"/> when that level declares it.</param>
public record EffectiveOutlet(
    string Name,
    IReadOnlyList<EffectiveOutletItem> Items,
    IReadOnlyList<RemovedOutletItem> Removed,
    IReadOnlyList<string> Sources,
    string Summary,
    IReadOnlyList<OutletDiagnostic> Diagnostics,
    OutletKind? Kind = null,
    OutletSubject? Subject = null,
    string? Slot = null,
    string? DeclaredBy = null,
    OutletMode? Mode = null);
