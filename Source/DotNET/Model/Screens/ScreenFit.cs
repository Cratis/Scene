// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Screens;

/// <summary>
/// A place a slice's screen fits: Screenplay's <c language="screenplay">fits dialog, drawer, pane</c>. A screen lists them in
/// order of preference, and placement takes the first one the page has free when an action opens the screen automatically.
/// </summary>
/// <remarks>
/// A dialog and a drawer sit over the page, so every page has them. A page, a pane and a panel are slots of the page,
/// matched by their <see cref="Layouts.SlotRole"/>.
/// </remarks>
public enum ScreenFit
{
    /// <summary>A dialog over the page.</summary>
    Dialog = 0,

    /// <summary>A drawer over the page.</summary>
    Drawer = 1,

    /// <summary>A slot of the page whose role is a pane.</summary>
    Pane = 2,

    /// <summary>A slot of the page whose role is a panel.</summary>
    Panel = 3,

    /// <summary>A slot of the page whose role is a page.</summary>
    Page = 4,
}
