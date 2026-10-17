// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// The ways a shell can present its navigation; the value of the <c language="csharp">navigationMode</c> shell option.
/// </summary>
public enum NavigationMode
{
    /// <summary>
    /// A sidebar that is always visible.
    /// </summary>
    Static = 0,

    /// <summary>
    /// Hidden until the hamburger slides it over the content.
    /// </summary>
    Overlay = 1,

    /// <summary>
    /// A narrow rail with icons only.
    /// </summary>
    Slim = 2,

    /// <summary>
    /// A rail with an icon and a small label.
    /// </summary>
    SlimPlus = 3,

    /// <summary>
    /// A narrower sidebar with tighter rows.
    /// </summary>
    Compact = 4,

    /// <summary>
    /// The items live in the top bar.
    /// </summary>
    Horizontal = 5,

    /// <summary>
    /// A rail that expands to the full menu on hover.
    /// </summary>
    Reveal = 6,

    /// <summary>
    /// Hidden until the hamburger opens it over a scrim.
    /// </summary>
    Drawer = 7
}
