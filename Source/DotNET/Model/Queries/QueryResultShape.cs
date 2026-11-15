// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Serialization;

namespace Cratis.Scene.Model.Queries;

/// <summary>
/// The shape of what a query returns.
/// </summary>
[SuppressMessage("Naming", "CA1720:Identifier contains type name", Justification = "The member names are the contract shared with the TypeScript model.")]
public enum QueryResultShape
{
    /// <summary>
    /// Many items.
    /// </summary>
    Collection = 0,

    /// <summary>
    /// Exactly one item.
    /// </summary>
    Single = 1,

    /// <summary>
    /// One item or none.
    /// </summary>
    [JsonStringEnumMemberName("optional-single")]
    OptionalSingle = 2,
}
