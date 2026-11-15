// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Removes an element. Names exactly one of a screen and a template.
/// </summary>
/// <param name="Element">The element's id.</param>
/// <param name="Screen">The screen the element is in.</param>
/// <param name="Template">The template the element is in (template mode).</param>
public record RemoveOperation(string Element, string? Screen = null, string? Template = null) : DesignOperation
{
    /// <inheritdoc/>
    public override string Op => "remove";
}
