// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Shell;

/// <summary>
/// What kind of template the shell is.
/// </summary>
public enum ShellKind
{
    /// <summary>
    /// A layout, which is what blueprints ship as application shells.
    /// </summary>
    Layout = 0,

    /// <summary>
    /// A screen template at the Application scope with the root role.
    /// </summary>
    ScreenTemplate = 1
}
