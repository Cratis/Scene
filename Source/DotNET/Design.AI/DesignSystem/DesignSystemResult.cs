// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.Operations;

namespace Cratis.Scene.Design.AI.DesignSystem;

/// <summary>
/// What establishing or revising a design system came to.
/// </summary>
/// <param name="Succeeded">Whether the turn reached a clean state. A turn that did not changes nothing: it has no draft.</param>
/// <param name="Summary">What the model changed, then the conflicts and gaps a person has to decide - plain sentences; why the turn failed when it did.</param>
/// <param name="Draft">The Screenplay of the draft - the <c language="text">design system</c> and its <c language="text">theme</c>s - checked by the compiler; <see langword="null"/> when the turn wrote none.</param>
/// <param name="Conflicts">The values the sources use for what looks like the same purpose, for a person to decide. Their identities are stable: finding them again changes nothing.</param>
/// <param name="Diagnostics">What the compiler and the design system's own checks still say about the draft: warnings, such as contrast below what a rule requires.</param>
/// <param name="Missing">What the host could not read, which the summary says leaves something out.</param>
public record DesignSystemResult(
    bool Succeeded,
    string Summary,
    string? Draft,
    IReadOnlyList<DesignSystemConflict> Conflicts,
    IReadOnlyList<DesignDiagnostic> Diagnostics,
    IReadOnlyList<string> Missing)
{
    /// <summary>
    /// Creates the result of a turn that could not reach a clean state.
    /// </summary>
    /// <param name="reason">Why.</param>
    /// <returns>The result; it changes nothing.</returns>
    public static DesignSystemResult Failed(string reason) => new(false, reason, null, [], [], []);
}
