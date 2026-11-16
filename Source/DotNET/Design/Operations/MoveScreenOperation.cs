// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Moves a screen to a position in the screen set, which reorders the default storyline.
/// </summary>
/// <param name="Name">The screen's name.</param>
/// <param name="Index">The position.</param>
public record MoveScreenOperation(string Name, int Index) : DesignOperation
{
    /// <inheritdoc/>
    public override string Op => "moveScreen";
}
