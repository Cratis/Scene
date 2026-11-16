// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Removes a screen from the design.
/// </summary>
/// <param name="Name">The screen's name.</param>
public record RemoveScreenOperation(string Name) : DesignOperation
{
    /// <inheritdoc/>
    public override string Op => "removeScreen";
}
