// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Represents an interaction started by a declared application trigger firing.
/// </summary>
/// <param name="TriggerName">The declared application trigger.</param>
public record ApplicationTriggerInteractionTrigger(string TriggerName) : InteractionTrigger;
