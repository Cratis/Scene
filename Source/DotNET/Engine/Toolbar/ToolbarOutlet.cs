// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Outlets;
using Cratis.Scene.Model.Toolbar;

namespace Cratis.Scene.Engine.Toolbar;

/// <summary>
/// A screen template's toolbar is an outlet of actions; this turns the toolbar shapes Scene had before outlets into it.
/// The TypeScript engine's <c language="typescript">toolbarAsOutletRefinement</c> does the same.
/// </summary>
public static class ToolbarOutlet
{
    /// <summary>
    /// The name of the outlet of actions a screen template's toolbar is.
    /// </summary>
    public const string Name = "toolbar";

    /// <summary>
    /// Turns a toolbar button into the button of the outlet of actions the toolbar is. A hand-authored button's target (a
    /// command name) becomes the outlet button's command.
    /// </summary>
    /// <param name="button">The toolbar button.</param>
    /// <returns>The outlet button.</returns>
    public static OutletButton AsOutletButton(ToolbarButton button) => new()
    {
        Id = button.Id,
        Title = button.Title,
        Icon = button.Icon,
        Slice = button.Slice,
        Command = button.Target,
        Emphasis = button.Emphasis,
    };

    /// <summary>
    /// Turns the toolbar of a feature or module - whose buttons were added to every screen's toolbar - into a refinement that
    /// extends the <c language="screenplay">toolbar</c> outlet with those buttons.
    /// </summary>
    /// <param name="toolbar">The feature or module toolbar.</param>
    /// <param name="outlet">The outlet it extends; <c language="screenplay">toolbar</c> when <see langword="null"/>.</param>
    /// <returns>The refinement.</returns>
    public static OutletRefinement AsRefinement(Model.Toolbar.Toolbar toolbar, string? outlet = null) =>
        new(outlet ?? Name, OutletMode.Extends, [.. toolbar.Buttons.Select(AsOutletButton)]);
}
