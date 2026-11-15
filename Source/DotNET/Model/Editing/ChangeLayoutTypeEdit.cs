// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Descriptors;

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// Changes the layout type of a layout node.
/// </summary>
/// <param name="NodeId">The node.</param>
/// <param name="To">The layout type to change to.</param>
/// <param name="AcceptLoss">Whether the author accepts a conversion that loses information.</param>
public record ChangeLayoutTypeEdit(
    string NodeId,
    LayoutType To,
    bool? AcceptLoss = null) : SceneEdit;
