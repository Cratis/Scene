// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Common;

/// <summary>
/// How an element aligns vertically within the space allotted to it.
/// </summary>
public enum VerticalAlignment
{
    /// <summary>
    /// Stretch to fill the available height.
    /// </summary>
    Stretch = 0,

    /// <summary>
    /// Align to the top edge.
    /// </summary>
    Top = 1,

    /// <summary>
    /// Align to the vertical center.
    /// </summary>
    Center = 2,

    /// <summary>
    /// Align to the bottom edge.
    /// </summary>
    Bottom = 3
}
