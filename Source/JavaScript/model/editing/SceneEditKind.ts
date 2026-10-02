// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Every edit the engine applies. Each is a plain, serialisable record, so a host can persist it, replay it and
 * build undo and redo on top.
 */
export enum SceneEditKind {
    SetProperty = 'setProperty',
    ResetProperty = 'resetProperty',
    ChangeLayoutType = 'changeLayoutType',
    InsertNode = 'insertNode',
    MoveNode = 'moveNode',
    RemoveNode = 'removeNode',
    SetInstanceValue = 'setInstanceValue',
    ResetInstanceValue = 'resetInstanceValue',
    AddCollectionItem = 'addCollectionItem',
    RemoveCollectionItem = 'removeCollectionItem',
    ReorderCollectionItem = 'reorderCollectionItem',
    EditCollectionItem = 'editCollectionItem',
    ExposeProperty = 'exposeProperty',
    UnexposeProperty = 'unexposeProperty',
}
