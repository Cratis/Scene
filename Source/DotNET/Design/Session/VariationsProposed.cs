// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Chronicle.Events;

namespace Cratis.Scene.Design.Session;

/// <summary>
/// Layouts of a screen were asked for and offered.
/// </summary>
/// <param name="GroupId">The group's id.</param>
/// <param name="Screen">The screen.</param>
/// <param name="Candidates">The layouts offered.</param>
/// <param name="Prompt">What was asked for; empty when it is not recorded.</param>
[EventType]
public record VariationsProposed(string GroupId, string Screen, IReadOnlyList<ProposedVariation> Candidates, string Prompt = "");
