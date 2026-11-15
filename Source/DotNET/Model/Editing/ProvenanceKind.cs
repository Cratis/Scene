// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// Where a node comes from, relative to the editing scope.
/// </summary>
public enum ProvenanceKind
{
    /// <summary>
    /// The scope owns the node.
    /// </summary>
    Local = 0,

    /// <summary>
    /// The node comes from an owner further out and is read-only.
    /// </summary>
    Inherited = 1,

    /// <summary>
    /// The node comes from an owner further out, but some of its properties are exposed to the scope.
    /// </summary>
    ConfigurableInherited = 2,
}
