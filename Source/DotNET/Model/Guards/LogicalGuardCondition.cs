// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Guards;

/// <summary>
/// Combines two structured predicates.
/// </summary>
/// <param name="Left">The first predicate.</param>
/// <param name="Operator">The logical operation.</param>
/// <param name="Right">The second predicate.</param>
public record LogicalGuardCondition(GuardCondition Left, LogicalGuardOperator Operator, GuardCondition Right) : GuardCondition;
