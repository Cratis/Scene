// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Represents an interaction started by an extension component raising a signal its contract declares.
/// </summary>
/// <param name="SignalName">The signal the component raised, as its contract names it.</param>
public record SignalInteractionTrigger(string SignalName) : InteractionTrigger;
