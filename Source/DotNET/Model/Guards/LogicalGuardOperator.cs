// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

namespace Cratis.Scene.Model.Guards;

/// <summary>
/// How two predicates combine.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter<LogicalGuardOperator>))]
public enum LogicalGuardOperator
{
    /// <summary>
    /// Both predicates must match.
    /// </summary>
    And = 0,

    /// <summary>
    /// Either predicate must match.
    /// </summary>
    Or = 1
}
