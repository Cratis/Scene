// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// The result of checking an operation: accepted, or refused.
/// </summary>
/// <param name="Refusal">Why it was refused; null when it is accepted.</param>
public record DesignValidation(DesignRefusal? Refusal)
{
    /// <summary>
    /// Gets a value indicating whether the operation is accepted.
    /// </summary>
    public bool Ok => Refusal is null;
}
