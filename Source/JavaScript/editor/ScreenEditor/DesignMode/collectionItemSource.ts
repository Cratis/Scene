// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CollectionOperation, SceneEditKind, type DestinationReference, type InspectedProperty } from '@cratis/scene.model';
import { inheritedReasonRule } from './designModeRules';
import { DesignModeItemSourceKind, designModeActions, type DesignModeItem, type DesignModeItemSource } from './designModeTypes';

export interface CollectionItemSourceInputs {
    componentId: string;

    // The items property of the component as Scene inspected it: the rows, which of them this scope may change, and what it may do to the list.
    property: InspectedProperty;
    newId: () => string;
    startingLabel: string;

    // Where a new item leads when the collection's items must lead somewhere (the first screen the host offers); without one such an item cannot be added.
    startingDestination?: DestinationReference;
}

const textOf = (value: unknown): string => (typeof value === 'string' ? value : '');

// The items of a component that holds them as the rows of a collection - a navigation bar's items - and what the design mode does to them. Rows
// an inherited template fixed are listed first, locked; positions are counted among the rows this scope owns, which is what Scene's reorder takes.
export function createCollectionItemSource({ componentId, property, newId, startingLabel, startingDestination }: CollectionItemSourceInputs): DesignModeItemSource {
    const path = property.descriptor.path;
    const rows = property.items ?? [];
    const own = rows.filter(row => row.editable);
    const operations = new Set(property.operations ?? []);
    const base = { component: componentId, path };

    const items: DesignModeItem[] = rows.map(row => {
        const ownIndex = own.indexOf(row);
        return {
            id: row.id,
            label: textOf(row.values.label) || textOf(row.values.title),
            index: ownIndex,
            count: own.length,
            readOnly: !row.editable,
            ...(row.editable ? {} : { readOnlyReason: inheritedReasonRule }),
            values: row.values,
            unlinked: row.values.destination === undefined && row.values.target === undefined,
        };
    });

    const allowed = (operation: CollectionOperation) => operations.has(operation);
    const refuse = (operation: CollectionOperation) => allowed(operation) ? undefined : { rejected: property.reason ?? operation };

    return {
        kind: DesignModeItemSourceKind.Collection,
        items,

        add: actionId => {
            if (actionId !== designModeActions.addItem) return { rejected: actionId };
            const refusal = refuse(CollectionOperation.Add);
            if (refusal) return refusal;
            // An item that must lead somewhere (the descriptor says it is required) starts leading to the first screen there is.
            const needsDestination = property.descriptor.item?.properties.some(field => field.path === 'destination' && field.constraints?.required === true) === true;
            if (needsDestination && startingDestination === undefined) return { rejected: 'noDestination' };
            const id = newId();
            return {
                label: 'Add',
                edits: [{ kind: SceneEditKind.AddCollectionItem, ...base, item: { id, values: { label: startingLabel, ...(needsDestination ? { destination: startingDestination } : {}) } }, index: own.length }],
                select: { itemId: id },
                renameNext: true,
            };
        },

        act: (actionId, item) => {
            switch (actionId) {
                case designModeActions.moveEarlier:
                case designModeActions.moveLater: {
                    const refusal = refuse(CollectionOperation.Reorder);
                    if (refusal) return refusal;
                    const index = item.index + (actionId === designModeActions.moveEarlier ? -1 : 1);
                    if (index < 0 || index >= own.length) return { rejected: 'noWhere' };
                    return { label: 'Move', edits: [{ kind: SceneEditKind.ReorderCollectionItem, ...base, itemId: item.id, index }], select: { itemId: item.id } };
                }
                case designModeActions.duplicate: {
                    const refusal = refuse(CollectionOperation.Add);
                    if (refusal) return refusal;
                    const id = newId();
                    const row = rows.find(candidate => candidate.id === item.id);
                    return {
                        label: 'Duplicate',
                        edits: [{ kind: SceneEditKind.AddCollectionItem, ...base, item: { id, values: structuredClone(row?.values ?? {}) }, index: item.index + 1 }],
                        select: { itemId: id },
                    };
                }
                case designModeActions.delete: {
                    const refusal = refuse(CollectionOperation.Remove);
                    if (refusal) return refusal;
                    const next = own[item.index + 1] ?? own[item.index - 1];
                    return { label: 'Remove', edits: [{ kind: SceneEditKind.RemoveCollectionItem, ...base, itemId: item.id }], select: { itemId: next?.id ?? null } };
                }
                default: return { rejected: actionId };
            }
        },

        rename: (item, label) => {
            const refusal = refuse(CollectionOperation.EditFields);
            return refusal ?? { label: 'Rename', edits: [{ kind: SceneEditKind.EditCollectionItem, ...base, itemId: item.id, field: 'label', value: label }], select: { itemId: item.id } };
        },

        // The items of a collection carry their own destination (the Properties tab edits it); the design mode of a collection offers no choice of its own.
        choice: () => undefined,

        readOnlyActions: () => [],
    };
}
