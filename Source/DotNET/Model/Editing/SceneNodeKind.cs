// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// The kinds of node a document's index addresses.
/// </summary>
public enum SceneNodeKind
{
    /// <summary>
    /// A layout.
    /// </summary>
    Layout = 0,

    /// <summary>
    /// A screen template.
    /// </summary>
    ScreenTemplate = 1,

    /// <summary>
    /// A dialog template.
    /// </summary>
    DialogTemplate = 2,

    /// <summary>
    /// A screen.
    /// </summary>
    Screen = 3,

    /// <summary>
    /// A named slot of a layout, template or screen.
    /// </summary>
    Slot = 4,

    /// <summary>
    /// An element.
    /// </summary>
    Element = 5,

    /// <summary>
    /// A node of a flow arrangement.
    /// </summary>
    FlowNode = 6,

    /// <summary>
    /// A freeform arrangement.
    /// </summary>
    Freeform = 7,

    /// <summary>
    /// One placement within a freeform variant.
    /// </summary>
    Placement = 8,
}
