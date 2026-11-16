// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Asks for layouts of a screen on other templates.
/// </summary>
/// <param name="Screen">The screen.</param>
/// <param name="Templates">The templates to try; the design picks when none are named.</param>
public record VariationsOperation(string Screen, IReadOnlyList<string>? Templates = null) : DesignOperation
{
    /// <inheritdoc/>
    public override string Op => "variations";
}
