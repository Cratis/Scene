// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// Where the screen of the slice an action runs opens. The placement resolver that picks a fit for
/// <see cref="Automatic"/> is not part of this release yet; the value is stored so a model keeps what its author chose.
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
