// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// Every edit the engine applies.
/// </summary>
public enum SceneEditKind
{
    /// <summary>
    /// Sets a property of a node.
    /// </summary>
    SetProperty = 0,

    /// <summary>
    /// Takes a property of a node back to its default.
    /// </summary>
    ResetProperty = 1,

    /// <summary>
    /// Changes the layout type of a layout node.
    /// </summary>
    ChangeLayoutType = 2,

    /// <summary>
    /// Inserts a node into a slot or a container.
    /// </summary>
    InsertNode = 3,

    /// <summary>
    /// Moves a node.
    /// </summary>
    MoveNode = 4,

    /// <summary>
    /// Removes a node.
    /// </summary>
    RemoveNode = 5,

    /// <summary>
    /// Sets the value an instance contributes to an exposed property.
    /// </summary>
    SetInstanceValue = 6,

    /// <summary>
    /// Removes what an instance contributed to an exposed property.
    /// </summary>
    ResetInstanceValue = 7,

    /// <summary>
    /// Adds an item to an exposed collection.
    /// </summary>
    AddCollectionItem = 8,

    /// <summary>
    /// Removes an item from an exposed collection.
    /// </summary>
    RemoveCollectionItem = 9,

    /// <summary>
    /// Moves an item within an exposed collection.
    /// </summary>
    ReorderCollectionItem = 10,

    /// <summary>
    /// Changes one field of an item of an exposed collection.
    /// </summary>
    EditCollectionItem = 11,

    /// <summary>
    /// Lets what sits inside a layout or template configure one of its properties.
    /// </summary>
    ExposeProperty = 12,

    /// <summary>
    /// Stops exposing a property.
    /// </summary>
    UnexposeProperty = 13,
}
