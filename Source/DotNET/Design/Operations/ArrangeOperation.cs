// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Replaces the arrangement of a template's slots.
/// </summary>
/// <param name="Template">The template.</param>
/// <param name="Arrangement">The arrangement, as Scene JSON.</param>
public record ArrangeOperation(string Template, JsonElement Arrangement) : DesignOperation
{
    /// <inheritdoc/>
    public override string Op => "arrange";
}
