// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Fires a declared application trigger.
/// </summary>
/// <param name="Trigger">The application trigger to fire.</param>
public record RaiseTriggerAction(string Trigger) : InteractionAction;
