// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Toolbar;

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// The outlet of actions every dialog and drawer template declares: <c language="screenplay">outlet actions of actions</c> with Cancel
/// (<c language="screenplay">runs close</c>) and Submit (<c language="screenplay">runs submit</c>, primary). A template that declares its own
/// <c language="screenplay">actions</c> outlet replaces it.
/// </summary>
public static class DialogActionsOutlet
{
    /// <summary>
    /// The name of the outlet.
    /// </summary>
    public const string Name = "actions";

    /// <summary>
    /// Gets the outlet with its default Cancel and Submit buttons.
    /// </summary>
    public static Outlet Default { get; } = new(
        Name,
        OutletKind.Actions,
        [
            new OutletButton { Id = "cancel", Title = "Cancel", Runs = OutletBuiltInAction.Close },
            new OutletButton { Id = "submit", Title = "Submit", Runs = OutletBuiltInAction.Submit, Emphasis = ToolbarEmphasis.Primary },
        ]);
}
