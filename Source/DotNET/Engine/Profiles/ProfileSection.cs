// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// The section of the designer a problem belongs to.
/// </summary>
public enum ProfileSection
{
    /// <summary>
    /// The name and logo.
    /// </summary>
    App = 0,

    /// <summary>
    /// The shell.
    /// </summary>
    Shell = 1,

    /// <summary>
    /// The theme, scheme, accent, corners and font.
    /// </summary>
    Look = 2,

    /// <summary>
    /// The menu mode and menu theme.
    /// </summary>
    Menu = 3,

    /// <summary>
    /// The package list.
    /// </summary>
    Packages = 4,

    /// <summary>
    /// The preview sample data.
    /// </summary>
    SampleData = 5
}
