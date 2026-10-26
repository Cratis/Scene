// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Guards;

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// One whole action list selected by a predicate.
/// </summary>
/// <param name="Condition">The predicate selecting the branch.</param>
/// <param name="Actions">The actions to run in order.</param>
public record InteractionAlternative(GuardCondition Condition, IReadOnlyList<InteractionAction> Actions);
