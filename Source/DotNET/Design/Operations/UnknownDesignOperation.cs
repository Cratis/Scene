// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// An operation that names nothing a design knows. It is always refused.
/// </summary>
/// <param name="Name">What it called itself.</param>
public record UnknownDesignOperation([property: JsonIgnore] string Name) : DesignOperation
{
    /// <inheritdoc/>
    public override string Op => Name;
}
