// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Toolbar;

namespace Cratis.Scene.Engine.Toolbar;

/// <summary>
/// A toolbar button resolved against the application structure: what a renderer needs to draw it and to open its dialog.
/// </summary>
/// <param name="Id">The button identity.</param>
/// <param name="Title">The text shown on the button.</param>
/// <param name="Emphasis">How prominent the button is.</param>
/// <param name="Converted">Whether the slice was found from a hand-authored command rather than named directly.</param>
/// <param name="Icon">Qualified icon reference, when the button has one.</param>
/// <param name="Slice">The qualified id of the slice the button invokes, when it names or resolves to one.</param>
/// <param name="Command">The command the slice accepts; <see langword="null"/> unless the slice is a known state change.</param>
/// <param name="Dialog">The task dialog the button opens; <see langword="null"/> unless the slice is a known state change.</param>
public record ResolvedToolbarButton(
    string Id,
    string Title,
    ToolbarEmphasis Emphasis,
    bool Converted,
    string? Icon = null,
    string? Slice = null,
    string? Command = null,
    SliceDialog? Dialog = null);
