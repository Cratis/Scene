// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Guards;

/// <summary>
/// Compares a subject field with a scalar literal.
/// </summary>
/// <param name="Left">The subject field.</param>
/// <param name="Operator">The comparison.</param>
/// <param name="Right">A string, number, boolean or null literal.</param>
/// <param name="Enumeration">The member names, in ordinal order.</param>
public record ComparisonGuardCondition(SubjectReference Left, GuardOperator Operator, object? Right, IReadOnlyList<string>? Enumeration = null) : GuardCondition;
