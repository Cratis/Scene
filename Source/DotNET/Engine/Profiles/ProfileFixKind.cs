// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// What a one-click fix does.
/// </summary>
public enum ProfileFixKind
{
    /// <summary>
    /// Adds a package, with what it needs.
    /// </summary>
    AddPackage = 0,

    /// <summary>
    /// Drops the author's accent so the theme's own is used.
    /// </summary>
    UseThemeAccent = 1,

    /// <summary>
    /// Drops the own shell so the default blueprint is the shell.
    /// </summary>
    UseDefaultBlueprint = 2,

    /// <summary>
    /// Makes the logo initials.
    /// </summary>
    UseInitials = 3,

    /// <summary>
    /// Sets the menu mode to Drawer.
    /// </summary>
    SwitchToDrawer = 4
}
