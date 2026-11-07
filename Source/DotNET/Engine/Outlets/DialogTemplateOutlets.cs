// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Outlets;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Outlets;

/// <summary>
/// The outlets a dialog or drawer template offers.
/// </summary>
public static class DialogTemplateOutlets
{
    /// <summary>
    /// Gets the outlets a template declares, with the standard <c language="screenplay">actions</c> outlet (Cancel and Submit)
    /// first unless the template declares its own.
    /// </summary>
    /// <param name="template">The dialog template.</param>
    /// <returns>The outlets, in order.</returns>
    public static IReadOnlyList<Outlet> Of(DialogTemplate template)
    {
        var declared = template.Outlets ?? [];
        return declared.Any(outlet => outlet.Name == DialogActionsOutlet.Name) ? declared : [DialogActionsOutlet.Default, .. declared];
    }
}
