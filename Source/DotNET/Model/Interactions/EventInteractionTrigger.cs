// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Represents an interaction started by observing a modeled domain event.
/// </summary>
/// <param name="EventName">The event being observed.</param>
public record EventInteractionTrigger(string EventName) : InteractionTrigger;
