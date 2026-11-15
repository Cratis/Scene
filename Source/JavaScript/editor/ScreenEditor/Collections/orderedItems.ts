// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CollectionOperation, SceneEditKind, type DestinationReference, type InspectedProperty, type SceneEdit } from '@cratis/scene.model';
import type { OrderedItem, OrderedItemCapabilities, OrderedItemProposal } from '@cratis/components/ConfigurationEditor';

// A collection item as the shared ordered-item editor reads it: its identity plus the fields Scene describes.
export interface SceneOrderedItem extends OrderedItem {
    values: Record<string, unknown>;
    destinationReference?: DestinationReference;
}

const text = (value: unknown): string => (typeof value === 'string' ? value : '');

// The items of a collection property as the editor draws them. Items an inherited template fixed come first and are
// handed over separately: they are shown, in order, but cannot be edited, removed or moved past.
export function toOrderedItems(property: InspectedProperty): { items: SceneOrderedItem[]; fixed: SceneOrderedItem[] } {
    const all = (property.items ?? []).map<SceneOrderedItem & { editable: boolean }>(item => ({
        id: item.id,
        label: text(item.values.label),
        ...(item.values.icon ? { icon: item.values.icon as OrderedItem['icon'] } : {}),
        ...(isDestinationReference(item.values.destination) ? { destinationReference: item.values.destination, destination: item.values.destination.screen } : {}),
        values: item.values,
        editable: item.editable,
    }));

    return { fixed: all.filter(item => !item.editable), items: all.filter(item => item.editable) };
}

// What the author may do to the collection, from the operations Scene grants and the descriptor's limits.
export function toCapabilities(property: InspectedProperty): OrderedItemCapabilities {
    const operations = new Set(property.operations ?? []);
    const editFields = operations.has(CollectionOperation.EditFields);
    const maxItems = property.descriptor.constraints?.maximumItems;
    return {
        add: operations.has(CollectionOperation.Add),
        remove: operations.has(CollectionOperation.Remove),
        reorder: operations.has(CollectionOperation.Reorder),
        fields: { label: editFields ? 'editable' : 'readonly', icon: editFields ? 'editable' : 'readonly', destination: editFields ? 'editable' : 'readonly' },
        ...(maxItems !== undefined ? { maxItems } : {}),
        ...(property.reason ? { reasons: { add: property.reason, remove: property.reason, reorder: property.reason } } : {}),
    };
}

// The Scene edits that carry out what the author did in the ordered-item editor. Positions are among the scope's own
// items - the ones the template fixed are shown first but are not counted - which is also how the editor reports them.
export function proposalToEdits(componentId: string, property: InspectedProperty, proposal: OrderedItemProposal<SceneOrderedItem>): SceneEdit[] {
    const base = { component: componentId, path: property.descriptor.path };
    switch (proposal.kind) {
        case 'add':
            return [{ kind: SceneEditKind.AddCollectionItem, ...base, item: { id: proposal.item.id, values: itemValues(proposal.item) }, index: proposal.index }];
        case 'remove':
            return [{ kind: SceneEditKind.RemoveCollectionItem, ...base, itemId: proposal.item.id }];
        case 'move':
            return [{ kind: SceneEditKind.ReorderCollectionItem, ...base, itemId: proposal.item.id, index: proposal.toIndex }];
        case 'update':
            return [{ kind: SceneEditKind.EditCollectionItem, ...base, itemId: proposal.item.id, field: proposal.field, value: fieldValue(proposal.item, proposal.field) }];
    }
}

const fieldValue = (item: SceneOrderedItem, field: string): unknown =>
    field === 'destination' ? destinationValue(item) : (item as unknown as Record<string, unknown>)[field];

const itemValues = (item: SceneOrderedItem): Record<string, unknown> => ({
    ...item.values,
    label: item.label,
    ...(item.icon ? { icon: item.icon } : {}),
    ...(destinationValue(item) ? { destination: destinationValue(item) } : {}),
});

function destinationValue(item: SceneOrderedItem): DestinationReference | undefined {
    if (!item.destination && !item.destinationReference) return undefined;
    return { ...(item.destinationReference ?? {}), ...(item.destination ? { screen: item.destination } : {}) };
}

function isDestinationReference(value: unknown): value is DestinationReference {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    return ['screen', 'module', 'feature', 'slice', 'outlet', 'route', 'kind', 'dialog', 'routeParameterBindings'].some(property => property in value);
}
