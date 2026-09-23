// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Represents an interaction started by an elapsed interval.
/// </summary>
/// <param name="Seconds">How long elapses between occurrences, normalized to seconds.</param>
/// <remarks>
/// Normalized at conversion so nothing downstream has to carry a unit or convert one. A renderer schedules
/// seconds; it does not need to know the document said 'interval 5 minutes'.
/// </remarks>
public record IntervalInteractionTrigger(int Seconds) : InteractionTrigger;
