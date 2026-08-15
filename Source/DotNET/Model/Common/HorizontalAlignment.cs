// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Common;

/// <summary>
/// How an element aligns horizontally within the space allotted to it.
/// </summary>
public enum HorizontalAlignment
{
    /// <summary>
    /// Stretch to fill the available width.
    /// </summary>
    Stretch = 0,

    /// <summary>
    /// Align to the left edge.
    /// </summary>
    Left = 1,

    /// <summary>
    /// Align to the horizontal center.
    /// </summary>
    Center = 2,

    /// <summary>
    /// Align to the right edge.
    /// </summary>
    Right = 3
}
