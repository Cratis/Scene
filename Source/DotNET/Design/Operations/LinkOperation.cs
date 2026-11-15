// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Makes an element navigate to a screen. Names exactly one of a screen and a template.
/// </summary>
/// <param name="Element">The element's id.</param>
/// <param name="To">The screen it navigates to.</param>
/// <param name="Screen">The screen the element is in.</param>
/// <param name="Template">The template the element is in (template mode).</param>
/// <param name="Prop">The destination property; the element's first destination property when absent.</param>
public record LinkOperation(string Element, string To, string? Screen = null, string? Template = null, string? Prop = null) : DesignOperation
{
    /// <inheritdoc/>
    public override string Op => "link";
}
