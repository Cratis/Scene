// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Diagnostics.CodeAnalysis;

namespace Cratis.Scene.Model.Descriptors;

/// <summary>
/// The kind of value a property holds.
/// </summary>
[SuppressMessage("Naming", "CA1720:Identifier contains type name", Justification = "The member names are the contract shared with the TypeScript model.")]
public enum PropertyValueType
{
    /// <summary>
    /// Text.
    /// </summary>
    String = 0,

    /// <summary>
    /// A number.
    /// </summary>
    Number = 1,

    /// <summary>
    /// True or false.
    /// </summary>
    Boolean = 2,

    /// <summary>
    /// One of a set of choices.
    /// </summary>
    Enum = 3,

    /// <summary>
    /// An icon reference.
    /// </summary>
    Icon = 4,

    /// <summary>
    /// A destination naming a screen.
    /// </summary>
    Destination = 5,

    /// <summary>
    /// A query name or a query binding.
    /// </summary>
    QueryReference = 6,

    /// <summary>
    /// A list of items.
    /// </summary>
    Collection = 7,

    /// <summary>
    /// A structured value.
    /// </summary>
    Object = 8,

    /// <summary>
    /// Any JSON value.
    /// </summary>
    Json = 9,
}
