// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Chronicle.Events;
using Cratis.Scene.Design.Operations;

namespace Cratis.Scene.Design.Session;

/// <summary>
/// A screen gained a revision, which is now its current one.
/// </summary>
/// <param name="RevisionId">The new revision's id.</param>
/// <param name="Screen">The screen.</param>
/// <param name="Text">The Screenplay text.</param>
/// <param name="Operations">The operations that made it.</param>
/// <param name="Author">Who made it.</param>
/// <param name="Prompt">What was asked for; empty when there is none.</param>
/// <param name="TurnId">The turn it belongs to; empty when there is none.</param>
/// <param name="DesignSystemVersion">The version of the design system it was made against; empty when there is none.</param>
/// <param name="BasisRevisionId">The revision it was made from; the screen's current one when empty.</param>
/// <param name="RestoredFromRevisionId">The earlier revision it restores; empty when there is none.</param>
/// <param name="OriginSessionId">The session it was copied from; empty when there is none.</param>
/// <param name="OriginRevisionId">The revision of that session it was copied from; empty when there is none.</param>
[EventType]
public record ScreenRevisionRecorded(
    string RevisionId,
    string Screen,
    string Text,
    IReadOnlyList<DesignOperation> Operations,
    string Author,
    string Prompt = "",
    string TurnId = "",
    string DesignSystemVersion = "",
    string BasisRevisionId = "",
    string RestoredFromRevisionId = "",
    string OriginSessionId = "",
    string OriginRevisionId = "");
