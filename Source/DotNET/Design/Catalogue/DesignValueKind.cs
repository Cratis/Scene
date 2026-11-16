// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Diagnostics.CodeAnalysis;

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// The kinds of value a component property takes, as a design sees them.
/// </summary>
public enum DesignValueKind
{
    /// <summary>Text.</summary>
    Text = 0,

    /// <summary>A number.</summary>
    Number = 1,

    /// <summary>True or false.</summary>
    Boolean = 2,

    /// <summary>One of a fixed set of choices.</summary>
    Choice = 3,

    /// <summary>A reference to a query.</summary>
    Query = 4,

    /// <summary>An icon.</summary>
    Icon = 5,

    /// <summary>A screen to navigate to.</summary>
    Destination = 6,

    /// <summary>A list of items.</summary>
    List = 7,

    /// <summary>A nested object.</summary>
    [SuppressMessage("Naming", "CA1720:Identifier contains type name", Justification = "The member names are the contract shared with the TypeScript package.")]
    Object = 8,

    /// <summary>Anything else.</summary>
    Json = 9,
}
