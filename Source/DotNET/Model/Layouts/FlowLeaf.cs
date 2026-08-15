// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Elements;

namespace Cratis.Scene.Model.Layouts;

/// <summary>
/// A <see cref="FlowNode"/> leaf that positions one of the slot's own content elements within the flow tree.
/// </summary>
/// <param name="Content">The element being positioned.</param>
public record FlowLeaf(SceneElement Content) : FlowNode;
