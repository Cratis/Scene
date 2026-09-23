// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Represents one of the built-in interaction kinds.
/// </summary>
/// <param name="Kind">The kind.</param>
public record BuiltInInteractionTrigger(InteractionTriggerKind Kind) : InteractionTrigger;
