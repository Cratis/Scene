// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Shell;

/// <summary>
/// What kind of edit a <see cref="ShellSwitchChange"/> is. The camelCase names are what hosts show and exchange.
/// </summary>
public enum ShellSwitchChangeKind
{
    /// <summary>
    /// The content a screen placed in an outlet moved to another outlet of the new shell, or was dropped.
    /// </summary>
    Content = 0,

    /// <summary>
    /// A screen template that fits an outlet now fits the outlet of the new shell (or none, when its outlet was dropped).
    /// </summary>
    Placement = 1
}
