// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.Operations;

namespace Cratis.Scene.Design.Session;

/// <summary>
/// One state of a screen. It stores Screenplay text; turning that into a Scene document and back is the caller's, with Cratis.Scene.Screenplay.
/// A turn that touches several screens records one revision per screen, all with the same turn id.
/// </summary>
/// <param name="Id">Its id.</param>
/// <param name="Screen">The screen it is a state of.</param>
/// <param name="Text">The Screenplay text.</param>
/// <param name="Operations">The operations that made it.</param>
/// <param name="Author">Who made it.</param>
/// <param name="Prompt">What was asked for.</param>
/// <param name="TurnId">The turn it belongs to.</param>
/// <param name="DesignSystemVersion">The version of the design system it was made against.</param>
/// <param name="BasisRevision">The revision it was made from.</param>
/// <param name="RestoredFrom">The earlier revision it restores: a revert is a new revision, never a deletion.</param>
/// <param name="Origin">The revision of another session it was copied from.</param>
public record Revision(
    string Id,
    string Screen,
    string Text,
    IReadOnlyList<DesignOperation> Operations,
    string Author,
    string? Prompt = null,
    string? TurnId = null,
    string? DesignSystemVersion = null,
    string? BasisRevision = null,
    string? RestoredFrom = null,
    RevisionOrigin? Origin = null);
