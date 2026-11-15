// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// A Scene document read back from Screenplay, with whom it belongs to.
/// </summary>
/// <param name="SliceId">The identity of the slice the document belongs to; <see cref="Guid.Empty"/> when it belongs to none.</param>
/// <param name="ActorId">The identity of the role the document is written for, or null when it is for no role.</param>
/// <param name="Document">The Scene document text.</param>
public sealed record ImportedScreenDocument(Guid SliceId, string? ActorId, string Document)
{
    /// <summary>
    /// Gets the name of the role the document is written for, when the screens named one.
    /// </summary>
    public string? RoleName { get; init; }
}
