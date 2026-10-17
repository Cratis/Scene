// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// The direction of a move in the designer's list.
/// </summary>
public enum MoveDirection
{
    /// <summary>
    /// Stronger: wins a shared component name more often.
    /// </summary>
    Up = 0,

    /// <summary>
    /// Weaker.
    /// </summary>
    Down = 1
}
