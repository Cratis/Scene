// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.Operations;
using Cratis.Scene.Design.Session;

namespace Cratis.Scene.Design.AI.Turns;

/// <summary>
/// What a person asked a design turn for.
/// </summary>
/// <param name="TurnId">The id of the turn, shared by the revision of every screen it touches. The ids of what the turn records are made from it.</param>
/// <param name="Session">The design session as it is, folded from its events.</param>
/// <param name="Instruction">What the person asked for.</param>
/// <param name="Author">Who asked, recorded on every revision.</param>
/// <param name="Selection">What the person has selected - a screen, an element on it, or nothing - for an instruction that says <i>this</i>.</param>
/// <param name="Images">Sketches, screenshots or design exports to turn into screens.</param>
/// <param name="TemplateSet">The templates the turn may use, when the person narrowed them for it; otherwise the session's own set.</param>
public record DesignTurnRequest(
    string TurnId,
    DesignSession Session,
    string Instruction,
    string Author,
    DesignFocus? Selection = null,
    IReadOnlyList<DesignImage>? Images = null,
    IReadOnlyList<string>? TemplateSet = null);
