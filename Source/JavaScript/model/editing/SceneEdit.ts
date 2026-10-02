// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { AddCollectionItemEdit } from './AddCollectionItemEdit';
import { ChangeLayoutTypeEdit } from './ChangeLayoutTypeEdit';
import { EditCollectionItemEdit } from './EditCollectionItemEdit';
import { ExposePropertyEdit } from './ExposePropertyEdit';
import { InsertNodeEdit } from './InsertNodeEdit';
import { MoveNodeEdit } from './MoveNodeEdit';
import { RemoveCollectionItemEdit } from './RemoveCollectionItemEdit';
import { RemoveNodeEdit } from './RemoveNodeEdit';
import { ReorderCollectionItemEdit } from './ReorderCollectionItemEdit';
import { ResetInstanceValueEdit } from './ResetInstanceValueEdit';
import { ResetPropertyEdit } from './ResetPropertyEdit';
import { SetInstanceValueEdit } from './SetInstanceValueEdit';
import { SetPropertyEdit } from './SetPropertyEdit';
import { UnexposePropertyEdit } from './UnexposePropertyEdit';

/**
 * Any edit the engine applies, discriminated by `kind`.
 */
export type SceneEdit =
    | SetPropertyEdit
    | ResetPropertyEdit
    | ChangeLayoutTypeEdit
    | InsertNodeEdit
    | MoveNodeEdit
    | RemoveNodeEdit
    | SetInstanceValueEdit
    | ResetInstanceValueEdit
    | AddCollectionItemEdit
    | RemoveCollectionItemEdit
    | ReorderCollectionItemEdit
    | EditCollectionItemEdit
    | ExposePropertyEdit
    | UnexposePropertyEdit;
