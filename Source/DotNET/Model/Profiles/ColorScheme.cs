// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Profiles;

/// <summary>
/// Which colour scheme an application presents: always light, always dark, or following the viewer's system preference.
/// </summary>
public enum ColorScheme
{
    /// <summary>
    /// Always the light variant of the theme.
    /// </summary>
    Light = 0,

    /// <summary>
    /// Always the dark variant of the theme.
    /// </summary>
    Dark = 1,

    /// <summary>
    /// Follow the viewer's operating-system preference.
    /// </summary>
    System = 2
}
