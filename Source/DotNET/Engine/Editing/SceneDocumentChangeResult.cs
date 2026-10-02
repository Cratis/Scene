// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Editing;

/// <summary>
/// The outcome of checking that a changed document stays within what its editing scope may change.
/// </summary>
/// <param name="Violations">Everything that was wrong. Empty when the change is allowed.</param>
public record SceneDocumentChangeResult(IReadOnlyList<SceneDocumentViolation> Violations)
{
    /// <summary>
    /// Gets a value indicating whether the change is allowed.
    /// </summary>
    public bool IsValid => Violations.Count == 0;

    /// <summary>
    /// Gets the messages of every violation, one sentence after another, ready to show.
    /// </summary>
    public string Message => string.Join(' ', Violations.Select(violation => violation.Message));
}
