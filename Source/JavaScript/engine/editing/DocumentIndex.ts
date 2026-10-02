// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneDiagnostic, SceneNodeKind } from '@cratis/scene.model';

/**
 * A route into a {@link SceneDocument}: property names and array indexes, outermost first.
 */
export type DocumentPath = (string | number)[];

/**
 * Where a node sits in an array it can be inserted into, removed from or moved within.
 */
export interface ListLocation {
    /** The path of the array. */
    path: DocumentPath;

    /** The node's index in the array. */
    index: number;
}

/**
 * Everything the engine knows about one addressable node.
 */
export interface NodeRecord {
    id: string;
    kind: SceneNodeKind;

    /** A `LayoutType` for a layout node, the component name for a component, otherwise the kind of element. */
    typeId: string;

    /** A name for a tree or an inspector title. */
    label: string;

    /** Where the node's value is in the document. */
    path: DocumentPath;
    value: unknown;

    parentId?: string;

    /** The name of the layout, template, dialog template or screen that physically contains the node. */
    owner: string;
    ownerKind: SceneNodeKind;

    /** Set when the node is an item of an array: a child list or a slot's content. */
    list?: ListLocation;

    /** For an element held by a flow leaf: the id of that leaf. Removing or moving the element does so to the leaf. */
    leafId?: string;

    /** For an element positioned freeform: the ids of its placements, one per size-class variant. */
    placementIds?: string[];

    /**
     * For nodes inside a freeform element, whose content repeats in every size-class variant: the path prefix of
     * the copy this record describes, and the same prefix in each other variant. Edits are applied to every copy.
     */
    mirror?: { prefix: DocumentPath; others: DocumentPath[] };

    /** For a slot: the name. */
    slotName?: string;

    /** For a slot: where its content array is (or would be, when empty). */
    contentPath?: DocumentPath;
}

/**
 * Every addressable node of a document, by id, with the problems found while indexing.
 */
export interface DocumentIndex {
    nodes: Map<string, NodeRecord>;
    diagnostics: SceneDiagnostic[];
}
