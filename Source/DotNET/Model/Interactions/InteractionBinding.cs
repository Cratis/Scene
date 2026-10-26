// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;
using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Represents one interaction trigger to actions binding.
/// </summary>
/// <param name="Trigger">What starts it.</param>
/// <param name="Actions">The actions to run, in declared order.</param>
/// <param name="Condition">The guard that has to hold for the actions to run, when there is one.</param>
/// <param name="Alternatives">Ordered first-match branches; Actions is empty when these are supplied.</param>
/// <param name="Otherwise">The action list used when no alternative matches.</param>
[method: JsonConstructor]
public record InteractionBinding(
    InteractionTrigger Trigger,
    IReadOnlyList<InteractionAction> Actions,
    BindingExpression? Condition = null,
    IReadOnlyList<InteractionAlternative>? Alternatives = null,
    IReadOnlyList<InteractionAction>? Otherwise = null)
{
    /// <summary>
    /// Preserves the constructor used by earlier packages.
    /// </summary>
    /// <param name="trigger">What starts it.</param>
    /// <param name="actions">The actions to run.</param>
    /// <param name="condition">The existing binding guard.</param>
    public InteractionBinding(InteractionTrigger trigger, IReadOnlyList<InteractionAction> actions, BindingExpression? condition)
        : this(trigger, actions, condition, null, null)
    {
    }
}
