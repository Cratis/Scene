// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Structure;

/// <summary>
/// A module in the application hierarchy.
/// </summary>
/// <param name="Id">The module identity, unique in the application; the first segment of every qualified id below it.</param>
/// <param name="Name">The display name.</param>
/// <param name="Features">The module's top-level features, first feature first.</param>
/// <param name="Slices">The slices that belong directly to the module, when it has any.</param>
public record ModuleNode(string Id, string Name, IReadOnlyList<FeatureNode> Features, IReadOnlyList<SliceNode>? Slices = null);
