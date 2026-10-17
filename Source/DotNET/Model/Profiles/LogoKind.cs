// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Profiles;

/// <summary>
/// How the application's logo is made.
/// </summary>
public enum LogoKind
{
    /// <summary>
    /// One or two characters on a block in the accent colour. The default.
    /// </summary>
    Initials = 0,

    /// <summary>
    /// One icon from the closed set of logo icons on a block in the accent colour.
    /// </summary>
    Icon = 1,

    /// <summary>
    /// The author's own image, drawn without the accent block.
    /// </summary>
    Image = 2
}
