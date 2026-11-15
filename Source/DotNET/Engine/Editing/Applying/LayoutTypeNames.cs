// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;
using Cratis.Scene.Model.Descriptors;
using Cratis.Scene.Model.Editing;
using Cratis.Scene.Model.Exposure;
using Cratis.Scene.Model.Queries;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// The names a Scene document writes enumerations under, which are the same as the TypeScript engine reports in its messages.
/// </summary>
static class LayoutTypeNames
{
    /// <summary>
    /// Gets the name a layout type is written under.
    /// </summary>
    /// <param name="type">The layout type.</param>
    /// <returns>The name.</returns>
    public static string Of(LayoutType type) => Camel(type.ToString());

    /// <summary>
    /// Gets the name a node kind is written under.
    /// </summary>
    /// <param name="kind">The node kind.</param>
    /// <returns>The name.</returns>
    public static string Of(SceneNodeKind kind) => Camel(kind.ToString());

    /// <summary>
    /// Gets the name an editing scope kind is written under.
    /// </summary>
    /// <param name="kind">The scope kind.</param>
    /// <returns>The name.</returns>
    public static string Of(EditingScopeKind kind) => Camel(kind.ToString());

    /// <summary>
    /// Gets the name a binding source kind is written under.
    /// </summary>
    /// <param name="kind">The binding source kind.</param>
    /// <returns>The name.</returns>
    public static string Of(BindingSourceKind kind) => Camel(kind.ToString());

    /// <summary>
    /// Gets the name a collection operation is written under.
    /// </summary>
    /// <param name="operation">The operation.</param>
    /// <returns>The name.</returns>
    public static string Of(CollectionOperation operation) => operation == CollectionOperation.EditFields ? "edit-fields" : Camel(operation.ToString());

    /// <summary>
    /// Gets the name a query result shape is written under.
    /// </summary>
    /// <param name="shape">The shape.</param>
    /// <returns>The name.</returns>
    public static string Of(QueryResultShape shape) => shape == QueryResultShape.OptionalSingle ? "optional-single" : Camel(shape.ToString());

    static string Camel(string name) => char.ToLowerInvariant(name[0]) + name[1..];
}
