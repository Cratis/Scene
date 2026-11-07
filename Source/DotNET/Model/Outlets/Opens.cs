// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// Where the screen of the slice an action runs opens: Screenplay's <c language="screenplay">opens</c>. Buttons and menu
/// entries of an outlet of actions and the <c language="csharp">action</c> component share it. The engine's placement resolver
/// works out what <see cref="Automatic"/> resolves to, and checks an explicit choice against what the slice's screen fits and
/// the slots the page has.
/// </summary>
public enum Opens
{
    /// <summary>The first fit the page has free; the default.</summary>
    Automatic = 0,

    /// <summary>Run the slice's command directly, with no screen: Screenplay's <c language="screenplay">runs</c>.</summary>
    None = 1,

    /// <summary>In a dialog over the page.</summary>
    Dialog = 2,

    /// <summary>In a drawer over the page.</summary>
    Drawer = 3,

    /// <summary>In a slot of the page, named by the action's <see cref="OutletAction.OpensIn"/>.</summary>
    Slot = 4,
}
