// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Toolbar;

/// <summary>
/// A toolbar button that invokes a state change slice. It is a <c language="csharp">core:toolbarItem</c> with <c language="csharp">kind: Action</c>, a
/// <c language="csharp">slice</c> and an <c language="csharp">emphasis</c>.
/// </summary>
/// <param name="Id">The button identity.</param>
/// <param name="Title">The text shown on the button.</param>
/// <param name="Slice">The qualified id of the state change slice the button invokes, for example <c language="csharp">sales.orders.PlaceOrder</c>; absent for a button that has none yet.</param>
/// <param name="Emphasis">How prominent the button is; <see cref="ToolbarEmphasis.Secondary"/> when absent.</param>
/// <param name="Icon">Qualified icon reference, when the button has one.</param>
/// <param name="Target">The command a hand-authored button names instead of a slice. It is turned into the slice that accepts the command when exactly one does.</param>
public record ToolbarButton(
    string Id,
    string Title,
    string? Slice = null,
    ToolbarEmphasis? Emphasis = null,
    string? Icon = null,
    string? Target = null);
