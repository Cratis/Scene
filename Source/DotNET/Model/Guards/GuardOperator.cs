// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

namespace Cratis.Scene.Model.Guards;

/// <summary>
/// The supported literal comparisons.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter<GuardOperator>))]
public enum GuardOperator
{
    /// <summary>Equal values.</summary>
    Equal = 0,

    /// <summary>Different non-null values.</summary>
    NotEqual = 1,

    /// <summary>Numeric greater than.</summary>
    GreaterThan = 2,

    /// <summary>Numeric greater than or equal.</summary>
    GreaterThanOrEqual = 3,

    /// <summary>Numeric less than.</summary>
    LessThan = 4,

    /// <summary>Numeric less than or equal.</summary>
    LessThanOrEqual = 5,

    /// <summary>String or array containment.</summary>
    Contains = 6,

    /// <summary>String prefix.</summary>
    StartsWith = 7
}
