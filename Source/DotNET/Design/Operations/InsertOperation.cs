// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Puts a component into an outlet - a slot of the screen's template, or of the template being authored. Names exactly one of a screen and a template.
/// </summary>
/// <param name="Outlet">The outlet.</param>
/// <param name="Component">The component, by its id or bare name.</param>
/// <param name="Screen">The screen it goes in.</param>
/// <param name="Template">The template it goes in (template mode).</param>
/// <param name="Index">Its position in the outlet.</param>
/// <param name="Id">The id of the new element, when the caller needs to name it; otherwise one is made.</param>
/// <param name="Props">Its properties.</param>
public record InsertOperation(
    string Outlet,
    string Component,
    string? Screen = null,
    string? Template = null,
    int? Index = null,
    string? Id = null,
    IReadOnlyDictionary<string, JsonElement>? Props = null) : DesignOperation
{
    /// <inheritdoc/>
    public override string Op => "insert";
}
