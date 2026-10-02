// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CollectionOperation, DiagnosticCode, EditingScopeKind, SceneDocument, SceneEdit, SceneEditKind } from '@cratis/scene.model';
import { applyEdit, resolveEffectiveConfiguration, resolveTemplateChain } from '../index';
import { catalog, contextFor, createExposedDocument, createReExposedDocument, scopeOf } from '../given/a_scene_document';
import { apply, codesOf } from './given/edits';

const featureContext = contextFor(EditingScopeKind.ScreenTemplate, 'Feature');
const invoicesContext = contextFor(EditingScopeKind.Screen, 'Invoices');

function effectiveItems(document: SceneDocument, kind: EditingScopeKind, name: string): string[] {
    const configuration = resolveEffectiveConfiguration(resolveTemplateChain(document, scopeOf(kind, name, 'Shell')), document.instanceContributions, catalog);
    return configuration.components[0].values.find(value => value.path === 'items')!.items!.map(item => item.id);
}

const add = (id: string, values: Record<string, unknown> = { label: id }, index?: number): SceneEdit => ({
    kind: SceneEditKind.AddCollectionItem, component: 'navbar', path: 'items', item: { id, values }, index,
});

describe('when editing as an instance', () => {
    const document = createExposedDocument();

    it('should set an exposed scalar as the scope\'s instance', () => {
        const outcome = apply(document, { kind: SceneEditKind.SetInstanceValue, component: 'navbar', path: 'title', value: 'Billing' }, featureContext);
        outcome.applied.should.be.true;
        outcome.model.instanceContributions.should.deep.equal([{ instance: 'template:Feature', component: 'navbar', path: 'title', value: 'Billing' }]);
    });

    it('should replace the earlier value rather than add another', () => {
        const first = apply(document, { kind: SceneEditKind.SetInstanceValue, component: 'navbar', path: 'title', value: 'One' }, featureContext).model;
        const second = apply(first, { kind: SceneEditKind.SetInstanceValue, component: 'navbar', path: 'title', value: 'Two' }, featureContext).model;
        second.instanceContributions.should.have.length(1);
        (second.instanceContributions[0].value as string).should.equal('Two');
    });

    it('should never write into the inherited template', () => {
        const outcome = apply(document, { kind: SceneEditKind.SetInstanceValue, component: 'navbar', path: 'title', value: 'Billing' }, featureContext);
        outcome.model.screenTemplates.should.deep.equal(document.screenTemplates);
    });

    it('should reset by removing the contribution', () => {
        const set = apply(document, { kind: SceneEditKind.SetInstanceValue, component: 'navbar', path: 'title', value: 'Billing' }, featureContext).model;
        apply(set, { kind: SceneEditKind.ResetInstanceValue, component: 'navbar', path: 'title' }, featureContext).model.instanceContributions.should.be.empty;
    });

    it('should refuse a value of the wrong type', () => {
        codesOf(apply(document, { kind: SceneEditKind.SetInstanceValue, component: 'navbar', path: 'title', value: 7 }, featureContext)).should.deep.equal([DiagnosticCode.InvalidValue]);
    });

    it('should refuse a property that is not exposed', () => {
        codesOf(apply(document, { kind: SceneEditKind.SetInstanceValue, component: 'navbar', path: 'density', value: 'compact' }, featureContext)).should.deep.equal([DiagnosticCode.ContributionNotExposed]);
    });

    it('should refuse a component the scope does not inherit exposure on', () => {
        codesOf(apply(document, { kind: SceneEditKind.SetInstanceValue, component: 'nothing', path: 'title', value: 'x' }, featureContext)).should.deep.equal([DiagnosticCode.ContributionNotExposed]);
    });

    it('should refuse an exposure the nested template did not pass on', () => {
        codesOf(apply(document, { kind: SceneEditKind.SetInstanceValue, component: 'navbar', path: 'title', value: 'Sneaky' }, invoicesContext)).should.deep.equal([DiagnosticCode.ContributionNotExposed]);
    });

    it('should let the screen configure once the nested template re-exposes', () => {
        apply(createReExposedDocument(), { kind: SceneEditKind.SetInstanceValue, component: 'navbar', path: 'title', value: 'Mine' }, invoicesContext).applied.should.be.true;
    });

    it('should refuse to act as another instance', () => {
        codesOf(apply(document, { kind: SceneEditKind.SetInstanceValue, instance: 'screen:Customers', component: 'navbar', path: 'title', value: 'x' }, featureContext)).should.deep.equal([DiagnosticCode.UnknownInstance]);
    });

    it('should refuse a scalar edit on a collection', () => {
        codesOf(apply(document, { kind: SceneEditKind.SetInstanceValue, component: 'navbar', path: 'items', value: [] }, featureContext)).should.deep.equal([DiagnosticCode.InvalidEdit]);
    });

    describe('on a collection', () => {
        const withItems = (() => {
            let current = document;
            for (const id of ['one', 'two', 'three']) current = apply(current, add(id), featureContext).model;
            return current;
        })();

        it('should add items after the owner\'s own, each by id', () => {
            effectiveItems(withItems, EditingScopeKind.ScreenTemplate, 'Feature').should.deep.equal(['home', 'one', 'two', 'three']);
        });

        it('should insert among the instance\'s own items', () => {
            const outcome = apply(withItems, add('zero', { label: 'Zero' }, 0), featureContext);
            effectiveItems(outcome.model, EditingScopeKind.ScreenTemplate, 'Feature').should.deep.equal(['home', 'zero', 'one', 'two', 'three']);
        });

        it('should remove an item by id', () => {
            const outcome = apply(withItems, { kind: SceneEditKind.RemoveCollectionItem, component: 'navbar', path: 'items', itemId: 'two' }, featureContext);
            effectiveItems(outcome.model, EditingScopeKind.ScreenTemplate, 'Feature').should.deep.equal(['home', 'one', 'three']);
        });

        it('should drop the contribution when its last item goes', () => {
            let current = apply(document, add('only'), featureContext).model;
            current = apply(current, { kind: SceneEditKind.RemoveCollectionItem, component: 'navbar', path: 'items', itemId: 'only' }, featureContext).model;
            current.instanceContributions.should.be.empty;
        });

        it('should reorder by id', () => {
            const outcome = apply(withItems, { kind: SceneEditKind.ReorderCollectionItem, component: 'navbar', path: 'items', itemId: 'three', index: 0 }, featureContext);
            effectiveItems(outcome.model, EditingScopeKind.ScreenTemplate, 'Feature').should.deep.equal(['home', 'three', 'one', 'two']);
        });

        it('should edit one field of an item', () => {
            const outcome = apply(withItems, { kind: SceneEditKind.EditCollectionItem, component: 'navbar', path: 'items', itemId: 'one', field: 'label', value: 'Uno' }, featureContext);
            (outcome.model.instanceContributions[0].items![0].values.label as string).should.equal('Uno');
        });

        it('should accept an icon and a destination as item fields', () => {
            const outcome = apply(document, add('rich', { label: 'Rich', icon: { library: 'lucide', key: 'home', variant: 'solid' }, destination: { screen: 'Elsewhere' } }), featureContext);
            outcome.applied.should.be.true;
        });

        it('should refuse an item id that is already used, including the owner\'s', () => {
            codesOf(apply(withItems, add('one'), featureContext)).should.deep.equal([DiagnosticCode.DuplicateCollectionItem]);
            codesOf(apply(withItems, add('home'), featureContext)).should.deep.equal([DiagnosticCode.DuplicateCollectionItem]);
        });

        it('should refuse an item with no id', () => {
            codesOf(apply(document, add(''), featureContext)).should.deep.equal([DiagnosticCode.InvalidValue]);
        });

        it('should refuse a field the items do not have, and a field of the wrong type', () => {
            codesOf(apply(document, add('x', { label: 'X', badge: 1 }), featureContext)).should.deep.equal([DiagnosticCode.UnknownCollectionField]);
            codesOf(apply(document, add('x', { label: 'X', icon: 'plain' }), featureContext)).should.deep.equal([DiagnosticCode.InvalidValue]);
        });

        it('should refuse an item missing a required field', () => {
            codesOf(apply(document, add('x', {}), featureContext)).should.deep.equal([DiagnosticCode.InvalidValue]);
        });

        it('should refuse more items than the collection allows', () => {
            let current = document;
            for (const id of ['1', '2', '3', '4', '5']) current = apply(current, add(id), featureContext).model;
            codesOf(apply(current, add('6'), featureContext)).should.deep.equal([DiagnosticCode.InvalidValue]);
        });

        it('should refuse a position that does not exist', () => {
            codesOf(apply(withItems, add('x', { label: 'X' }, 9), featureContext)).should.deep.equal([DiagnosticCode.IndexOutOfRange]);
            codesOf(apply(withItems, { kind: SceneEditKind.ReorderCollectionItem, component: 'navbar', path: 'items', itemId: 'one', index: 9 }, featureContext)).should.deep.equal([DiagnosticCode.IndexOutOfRange]);
        });

        it('should refuse to change the owner\'s fixed item', () => {
            codesOf(apply(withItems, { kind: SceneEditKind.RemoveCollectionItem, component: 'navbar', path: 'items', itemId: 'home' }, featureContext)).should.deep.equal([DiagnosticCode.ContributionOperationNotPermitted]);
            codesOf(apply(withItems, { kind: SceneEditKind.EditCollectionItem, component: 'navbar', path: 'items', itemId: 'home', field: 'label', value: 'x' }, featureContext)).should.deep.equal([DiagnosticCode.ContributionOperationNotPermitted]);
        });

        it('should refuse an item the instance does not have', () => {
            codesOf(apply(withItems, { kind: SceneEditKind.RemoveCollectionItem, component: 'navbar', path: 'items', itemId: 'ghost' }, featureContext)).should.deep.equal([DiagnosticCode.CollectionItemNotFound]);
        });

        it('should refuse to change an item another instance added', () => {
            const reExposed = createReExposedDocument();
            const featureItem = apply(reExposed, add('from-feature'), featureContext).model;
            codesOf(apply(featureItem, { kind: SceneEditKind.EditCollectionItem, component: 'navbar', path: 'items', itemId: 'from-feature', field: 'label', value: 'x' }, invoicesContext)).should.deep.equal([DiagnosticCode.ContributionOperationNotPermitted]);
        });
    });

    describe('with only some operations exposed', () => {
        const restricted = (operations: CollectionOperation[], editableFields?: string[]) => {
            const copy = createExposedDocument();
            copy.exposures[0].properties[0].operations = operations;
            copy.exposures[0].properties[0].editableFields = editableFields;
            return copy;
        };

        it('should refuse each operation that was not granted', () => {
            const addOnly = apply(restricted([CollectionOperation.Add]), add('one'), featureContext).model;
            codesOf(apply(addOnly, { kind: SceneEditKind.RemoveCollectionItem, component: 'navbar', path: 'items', itemId: 'one' }, featureContext)).should.deep.equal([DiagnosticCode.ContributionOperationNotPermitted]);
            codesOf(apply(addOnly, { kind: SceneEditKind.ReorderCollectionItem, component: 'navbar', path: 'items', itemId: 'one', index: 0 }, featureContext)).should.deep.equal([DiagnosticCode.ContributionOperationNotPermitted]);
            codesOf(apply(addOnly, { kind: SceneEditKind.EditCollectionItem, component: 'navbar', path: 'items', itemId: 'one', field: 'label', value: 'x' }, featureContext)).should.deep.equal([DiagnosticCode.ContributionOperationNotPermitted]);
        });

        it('should refuse to add when adding was not granted', () => {
            codesOf(apply(restricted([CollectionOperation.Remove]), add('one'), featureContext)).should.deep.equal([DiagnosticCode.ContributionOperationNotPermitted]);
        });

        it('should refuse to edit a field that was not exposed for editing', () => {
            const labelOnly = apply(restricted([CollectionOperation.Add, CollectionOperation.EditFields], ['label']), add('one'), featureContext).model;
            codesOf(apply(labelOnly, { kind: SceneEditKind.EditCollectionItem, component: 'navbar', path: 'items', itemId: 'one', field: 'destination', value: { screen: 'X' } }, featureContext)).should.deep.equal([DiagnosticCode.ContributionOperationNotPermitted]);
            apply(labelOnly, { kind: SceneEditKind.EditCollectionItem, component: 'navbar', path: 'items', itemId: 'one', field: 'label', value: 'Uno' }, featureContext).applied.should.be.true;
        });

        it('should refuse to add an item that sets a field that was not exposed', () => {
            codesOf(apply(restricted([CollectionOperation.Add], ['label']), add('one', { label: 'One', destination: { screen: 'X' } }), featureContext)).should.deep.equal([DiagnosticCode.ContributionOperationNotPermitted]);
        });
    });

    it('should leave the same document in place when refusing', () => {
        const input = structuredClone(document);
        const outcome = applyEdit(input, add('one', {}), featureContext);
        (outcome.model === input).should.be.true;
    });
});
