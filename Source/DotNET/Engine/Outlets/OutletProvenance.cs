// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Outlets;

/// <summary>
/// Where an item of a resolved outlet comes from.
/// </summary>
/// <param name="Owner">The name of the level that put the item there.</param>
/// <param name="Level">Where in the chain that level sits.</param>
/// <param name="Source">How the item came in.</param>
public record OutletProvenance(string Owner, OutletLevelKind Level, OutletItemSource Source);
