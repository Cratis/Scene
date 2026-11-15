// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Adds a screen built on a template of the catalogue.
/// </summary>
/// <param name="Name">The new screen's name.</param>
/// <param name="Template">The template it is built on.</param>
public record AddScreenOperation(string Name, string Template) : DesignOperation
{
    /// <inheritdoc/>
    public override string Op => "addScreen";
}
