// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Chronicle.Events;

namespace Cratis.Scene.Design.Session;

/// <summary>
/// One of the layouts became the screen's next revision.
/// </summary>
/// <param name="GroupId">The group.</param>
/// <param name="CandidateId">The layout chosen.</param>
/// <param name="RevisionId">The new revision's id.</param>
/// <param name="Author">Who chose it.</param>
/// <param name="TurnId">The turn it belongs to; empty when there is none.</param>
[EventType]
public record VariationChosen(string GroupId, string CandidateId, string RevisionId, string Author, string TurnId = "");
