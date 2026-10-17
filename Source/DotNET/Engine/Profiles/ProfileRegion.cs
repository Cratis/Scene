// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// A part of the previewed application the author can point at to edit it (designer contract rule N9).
/// </summary>
public enum ProfileRegion
{
    /// <summary>
    /// The logo and the application name wherever they are drawn.
    /// </summary>
    Identity = 0,

    /// <summary>
    /// The top bar.
    /// </summary>
    Shell = 1,

    /// <summary>
    /// The sidebar, or the horizontal menu items in Horizontal mode.
    /// </summary>
    Menu = 2,

    /// <summary>
    /// The content card.
    /// </summary>
    Content = 3,

    /// <summary>
    /// The primary action.
    /// </summary>
    Accent = 4
}
