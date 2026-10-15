// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Structure;

/// <summary>
/// A feature in the application hierarchy; features nest.
/// </summary>
/// <param name="Id">The feature identity, unique among its siblings; its qualified form is the dotted path from the module.</param>
/// <param name="Name">The display name.</param>
/// <param name="Features">The sub-features.</param>
/// <param name="Slices">The slices that belong directly to this feature.</param>
public record FeatureNode(string Id, string Name, IReadOnlyList<FeatureNode> Features, IReadOnlyList<SliceNode> Slices);
