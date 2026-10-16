// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Shell;

/// <summary>
/// What happens to the content one outlet of the current shell holds when the shell is switched. The camelCase names are what hosts show and exchange.
/// </summary>
public enum ShellOutletAction
{
    /// <summary>
    /// The new shell has an outlet of the same name; the content stays where it is.
    /// </summary>
    Keep = 0,

    /// <summary>
    /// The outlet is the current shell's primary outlet (or is named <c language="csharp">content</c>) and the content follows to the new shell's primary outlet under another name.
    /// </summary>
    Primary = 1,

    /// <summary>
    /// The user chose to move the content into the new shell's primary outlet ("Move into content").
    /// </summary>
    MoveToPrimary = 2,

    /// <summary>
    /// The user chose to move the content into another outlet of the new shell.
    /// </summary>
    MapTo = 3,

    /// <summary>
    /// The user chose to drop the content.
    /// </summary>
    Drop = 4,

    /// <summary>
    /// The new shell has no matching outlet and no screen uses the outlet, so nothing needs deciding.
    /// </summary>
    Unused = 5,

    /// <summary>
    /// The new shell has no matching outlet, screens use the outlet and no valid choice was made: the switch is blocked until one is.
    /// </summary>
    Unresolved = 6
}
