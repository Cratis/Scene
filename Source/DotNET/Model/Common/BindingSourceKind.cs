// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Common;

/// <summary>
/// The source a binding reads from.
/// </summary>
public enum BindingSourceKind
{
    /// <summary>The inherited effective data context for the element.</summary>
    DataContext = 0,

    /// <summary>The latest result of a named query binding.</summary>
    QueryResult = 1,

    /// <summary>An output property from another stable component identity.</summary>
    ComponentProperty = 2,

    /// <summary>A literal value carried by the binding.</summary>
    Literal = 3,
}
