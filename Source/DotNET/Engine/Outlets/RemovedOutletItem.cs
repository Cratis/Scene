// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Outlets;

namespace Cratis.Scene.Engine.Outlets;

/// <summary>
/// An inherited item a lower level hid or overrode. Editors list it struck through so it can be brought back.
/// </summary>
/// <param name="Item">The item.</param>
/// <param name="Provenance">Where the item came from.</param>
/// <param name="Removal">Why it is not shown.</param>
/// <param name="RemovedBy">The name of the level that hid or overrode it.</param>
public record RemovedOutletItem(OutletItem Item, OutletProvenance Provenance, OutletRemoval Removal, string RemovedBy);
