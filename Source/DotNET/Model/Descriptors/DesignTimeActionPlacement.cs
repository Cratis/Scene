// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Descriptors;

/// <summary>
/// Where a design-time action is offered.
/// </summary>
public enum DesignTimeActionPlacement
{
    /// <summary>
    /// On the toolbar.
    /// </summary>
    Toolbar = 0,

    /// <summary>
    /// In the context menu.
    /// </summary>
    ContextMenu = 1,

    /// <summary>
    /// In the inspector.
    /// </summary>
    Inspector = 2,
}
