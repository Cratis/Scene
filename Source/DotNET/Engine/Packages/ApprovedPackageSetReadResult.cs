// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Packages;

/// <summary>
/// The outcome of reading an approved package set: the set when it is valid, or every reason it is not.
/// </summary>
/// <param name="Set">The set, <see langword="null"/> when there are diagnostics.</param>
/// <param name="Diagnostics">Every problem found, each naming the package and the field, in a stable order.</param>
public record ApprovedPackageSetReadResult(ApprovedPackageSet? Set, IReadOnlyList<string> Diagnostics)
{
    /// <summary>
    /// Gets whether the set was read without problems.
    /// </summary>
    public bool Succeeded => Set is not null && Diagnostics.Count == 0;
}
