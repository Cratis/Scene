// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Toolbar;

namespace Cratis.Scene.Model.Navigation;

/// <summary>
/// An application-level toolbar button a navigation region declares: it opens the task dialog of a state change slice over the current page.
/// </summary>
/// <param name="Id">The button identity, unique in its region at the level that owns it.</param>
/// <param name="Title">The text shown on the button.</param>
/// <param name="Slice">The qualified id of the state change slice the button opens, for example <c language="csharp">sales.orders.PlaceOrder</c>; absent for a button that has none yet.</param>
/// <param name="Emphasis">How prominent the button is; <see cref="ToolbarEmphasis.Secondary"/> when absent.</param>
/// <param name="Icon">Qualified icon reference, when the button has one.</param>
/// <param name="Authorize">The policy the user must satisfy to see the button; the button is shown to everyone when absent.</param>
public record NavigationButton(
    string Id,
    string Title,
    string? Slice = null,
    ToolbarEmphasis? Emphasis = null,
    string? Icon = null,
    string? Authorize = null);
