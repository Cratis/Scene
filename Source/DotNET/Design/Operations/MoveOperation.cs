// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Moves an element to an outlet. Names exactly one of a screen and a template.
/// </summary>
/// <param name="Element">The element's id.</param>
/// <param name="Outlet">The outlet it moves to.</param>
/// <param name="Screen">The screen the element is in.</param>
/// <param name="Template">The template the element is in (template mode).</param>
/// <param name="Index">Its position in the outlet.</param>
public record MoveOperation(string Element, string Outlet, string? Screen = null, string? Template = null, int? Index = null) : DesignOperation
{
    /// <inheritdoc/>
    public override string Op => "move";
}
