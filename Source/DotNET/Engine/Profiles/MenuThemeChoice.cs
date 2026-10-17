// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// The surface colour of the menu; the value of the <c language="csharp">menuTheme</c> shell option.
/// </summary>
public enum MenuThemeChoice
{
    /// <summary>
    /// A light menu surface.
    /// </summary>
    Light = 0,

    /// <summary>
    /// A dark menu surface.
    /// </summary>
    Dark = 1,

    /// <summary>
    /// The menu surface uses the accent colour.
    /// </summary>
    Primary = 2
}
