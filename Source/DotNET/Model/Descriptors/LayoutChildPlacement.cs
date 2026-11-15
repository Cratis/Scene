// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Descriptors;

/// <summary>
/// How a layout type places its children.
/// </summary>
public enum LayoutChildPlacement
{
    /// <summary>
    /// It takes no children.
    /// </summary>
    None = 0,

    /// <summary>
    /// Children follow one another.
    /// </summary>
    Ordered = 1,

    /// <summary>
    /// Children are positioned.
    /// </summary>
    Positioned = 2,
}
