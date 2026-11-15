// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Offers controls to play with.
/// </summary>
/// <param name="Controls">The controls.</param>
public record TweaksOperation(IReadOnlyList<TweakControl> Controls) : DesignOperation
{
    /// <inheritdoc/>
    public override string Op => "tweaks";
}
