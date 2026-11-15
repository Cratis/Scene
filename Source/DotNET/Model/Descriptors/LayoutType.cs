// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Descriptors;

/// <summary>
/// The layout types the model defines.
/// </summary>
public enum LayoutType
{
    /// <summary>
    /// A flow row.
    /// </summary>
    FlowRow = 0,

    /// <summary>
    /// A flow column.
    /// </summary>
    FlowColumn = 1,

    /// <summary>
    /// A flow grid.
    /// </summary>
    FlowGrid = 2,

    /// <summary>
    /// A flow leaf holding an element.
    /// </summary>
    FlowLeaf = 3,

    /// <summary>
    /// A flow leaf holding a slot.
    /// </summary>
    FlowSlotLeaf = 4,

    /// <summary>
    /// A freeform arrangement.
    /// </summary>
    Freeform = 5,

    /// <summary>
    /// A stack panel.
    /// </summary>
    StackPanel = 6,

    /// <summary>
    /// A wrap panel.
    /// </summary>
    WrapPanel = 7,

    /// <summary>
    /// A dock panel.
    /// </summary>
    DockPanel = 8,

    /// <summary>
    /// A grid panel.
    /// </summary>
    GridPanel = 9,

    /// <summary>
    /// A canvas.
    /// </summary>
    Canvas = 10,
}
