// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Outlets;

namespace Cratis.Scene.Engine.Outlets;

/// <summary>
/// One item of a resolved outlet, with where it comes from.
/// </summary>
/// <param name="Item">The item.</param>
/// <param name="Provenance">Where the item comes from.</param>
/// <param name="Editable">Whether the level the outlet is resolved for put the item there, so an editor at that level can change it.</param>
public record EffectiveOutletItem(OutletItem Item, OutletProvenance Provenance, bool Editable);
