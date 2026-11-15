// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Sets a property of an element. Names exactly one of a screen and a template.
/// </summary>
/// <param name="Element">The element's id.</param>
/// <param name="Prop">The property.</param>
/// <param name="Value">The value.</param>
/// <param name="Screen">The screen the element is in.</param>
/// <param name="Template">The template the element is in (template mode).</param>
public record SetOperation(string Element, string Prop, JsonElement Value, string? Screen = null, string? Template = null) : DesignOperation
{
    /// <inheritdoc/>
    public override string Op => "set";
}
