// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// What kind of thing an editing scope is.
/// </summary>
public enum EditingScopeKind
{
    /// <summary>
    /// A screen.
    /// </summary>
    Screen = 0,

    /// <summary>
    /// A screen template.
    /// </summary>
    ScreenTemplate = 1,

    /// <summary>
    /// A dialog template.
    /// </summary>
    DialogTemplate = 2,

    /// <summary>
    /// A layout.
    /// </summary>
    Layout = 3
}
