// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Represents one interaction trigger to actions binding.
/// </summary>
/// <param name="Trigger">What starts it.</param>
/// <param name="Actions">The actions to run, in declared order.</param>
/// <param name="Condition">The guard that has to hold for the actions to run, when there is one.</param>
public record InteractionBinding(
    InteractionTrigger Trigger,
    IReadOnlyList<InteractionAction> Actions,
    BindingExpression? Condition = null);
