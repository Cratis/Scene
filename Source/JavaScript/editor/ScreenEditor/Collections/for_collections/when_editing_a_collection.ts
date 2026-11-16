// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CollectionOperation, PropertyValueType, SceneEditKind, ValueSource, type InspectedProperty } from '@cratis/scene.model';
import { proposalToEdits, toCapabilities, toOrderedItems, type SceneOrderedItem } from '../orderedItems';

const property = (extra: Partial<InspectedProperty> = {}): InspectedProperty => ({
    descriptor: { path: 'items', label: 'Items', group: 'Content', valueType: PropertyValueType.Collection, constraints: { maximumItems: 5 } },
    currentValue: [], effectiveValue: [], source: ValueSource.Default, editable: true,
    operations: [CollectionOperation.Add, CollectionOperation.Remove, CollectionOperation.Reorder, CollectionOperation.EditFields],
    items: [
        { id: 'home', values: { label: 'Home' }, origin: 'template:Shell', editable: false },
        { id: 'orders', values: { label: 'Orders', destination: { screen: 'Orders', route: '/orders/:id', slot: 'details', dialog: 'OrderDialog' } }, origin: 'screen:Screen', editable: true },
    ],
    ...extra,
});
const item = (id: string, label: string, extra: Partial<SceneOrderedItem> = {}): SceneOrderedItem => ({ id, label, values: {}, ...extra });

describe('when reading a collection a template fixed the first item of', () => {
    const { items, fixed } = toOrderedItems(property());

    it('should show the template\'s item as fixed', () => fixed.map(entry => entry.id).should.deep.equal(['home']));
    it('should leave only the screen\'s own items to edit', () => items.map(entry => entry.id).should.deep.equal(['orders']));
    it('should read the destination screen', () => items[0].destination!.should.equal('Orders'));
    it('should keep the full hierarchical destination reference', () => items[0].destinationReference!.should.deep.equal({ screen: 'Orders', route: '/orders/:id', slot: 'details', dialog: 'OrderDialog' }));
});

describe('when asking what may be done to a collection', () => {
    it('should allow what Scene grants', () => {
        const capabilities = toCapabilities(property());
        [capabilities.add, capabilities.remove, capabilities.reorder].should.deep.equal([true, true, true]);
    });
    it('should carry the descriptor\'s limit', () => toCapabilities(property()).maxItems!.should.equal(5));
    it('should allow nothing when Scene grants nothing', () => {
        const capabilities = toCapabilities(property({ operations: [] }));
        [capabilities.add, capabilities.remove, capabilities.reorder].should.deep.equal([false, false, false]);
    });
    it('should make the fields read only when they cannot be edited', () => toCapabilities(property({ operations: [CollectionOperation.Add] })).fields.label!.should.equal('readonly'));
    it('should give the reason Scene reported', () => toCapabilities(property({ reason: 'Not exposed.' })).reasons!.add!.should.equal('Not exposed.'));
});

describe('when the author adds an item', () => {
    const [edit] = proposalToEdits('nav', property(), { kind: 'add', item: item('new', 'Tools', { destination: 'Tools' }), index: 1, items: [] }) as { kind: string; item: { id: string; values: Record<string, unknown> }; index: number }[];

    it('should add a collection item', () => edit.kind.should.equal(SceneEditKind.AddCollectionItem));
    it('should carry its label and destination', () => edit.item.values.should.deep.equal({ label: 'Tools', destination: { screen: 'Tools' } }));
    it('should place it where it was added', () => edit.index.should.equal(1));
});

describe('when the author removes, moves or renames an item', () => {
    it('should remove it by id', () => (proposalToEdits('nav', property(), { kind: 'remove', item: item('orders', 'Orders'), index: 0, items: [] })[0] as { itemId: string }).itemId.should.equal('orders'));
    it('should reorder it to the new index', () => (proposalToEdits('nav', property(), { kind: 'move', item: item('orders', 'Orders'), fromIndex: 0, toIndex: 2, items: [] })[0] as { index: number }).index.should.equal(2));
    it('should edit just the field that changed', () => {
        const edit = proposalToEdits('nav', property(), { kind: 'update', item: item('orders', 'Orders!'), previous: item('orders', 'Orders'), field: 'label', items: [] })[0] as { field: string; value: unknown };
        [edit.field, edit.value].should.deep.equal(['label', 'Orders!']);
    });
    it('should preserve hierarchical destination metadata when the selected screen changes', () => {
        const edit = proposalToEdits('nav', property(), {
            kind: 'update',
            item: item('orders', 'Orders', { destination: 'Customers', destinationReference: { screen: 'Orders', route: '/orders/:id', slot: 'details', dialog: 'OrderDialog' } }),
            previous: item('orders', 'Orders', { destination: 'Orders' }),
            field: 'destination',
            items: [],
        })[0] as { value: unknown };
        (edit.value as Record<string, unknown>).should.deep.equal({ screen: 'Customers', route: '/orders/:id', slot: 'details', dialog: 'OrderDialog' });
    });
    it('should clear a destination that was removed', () =>
        (((proposalToEdits('nav', property(), { kind: 'update', item: item('orders', 'Orders'), previous: item('orders', 'Orders', { destination: 'Orders' }), field: 'destination', items: [] })[0]) as { value: unknown }).value === undefined).should.be.true);
});
