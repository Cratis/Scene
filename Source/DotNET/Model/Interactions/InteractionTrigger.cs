// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Represents what starts an interaction.
/// </summary>
/// <remarks>
/// An interaction trigger is never declared - it exists only as part of a binding. That makes it a different
/// concept from the application trigger a backend reaction consumes, which
/// <see cref="ApplicationTriggerInteractionTrigger"/> refers to by name.
/// </remarks>
[JsonPolymorphic]
[JsonDerivedType(typeof(BuiltInInteractionTrigger))]
[JsonDerivedType(typeof(EventInteractionTrigger))]
[JsonDerivedType(typeof(IntervalInteractionTrigger))]
[JsonDerivedType(typeof(ApplicationTriggerInteractionTrigger))]
public abstract record InteractionTrigger;
