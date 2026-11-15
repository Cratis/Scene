// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CollectionOperation, EditingScopeKind, PropertyValueType, SceneEditKind } from '@cratis/scene.model';
import { elementNodeId, inspect, type EditingContext } from '@cratis/scene.engine';
import { corePackage } from '@cratis/scene.react';
import { createScreenEditorRuntime } from '../../Runtime/screenEditorRuntime';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { contentSlot, createScreenDocument, screenName, studioLayout } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { applyToSession, openSession } from '../../Session/EditSession';
import { defaultCollectionOperations, exposePropertyEdit, isExposed, unexposePropertyEdit } from '../exposureEdits';
import { toOrderedItems } from '../../Collections/orderedItems';
import { proposalToEdits } from '../../Collections/orderedItems';
import type { SceneDocument } from '@cratis/scene.model';

const runtime = createScreenEditorRuntime([corePackage], { name: 'test', packages: [] } as never);
const authoring: EditingContext = { catalog: runtime.catalog, scope: { kind: EditingScopeKind.ScreenTemplate, name: 'Shell', layout: studioLayout.name } };
const usingScreen: EditingContext = { catalog: runtime.catalog, scope: { kind: EditingScopeKind.Screen, name: screenName } };

const documentWithNavigation = (): SceneDocument => {
    const base = createScreenDocument(createPanel(LayoutItem.Stack, 'root', 'Root'), 'Shell');
    const nav = createExternalComponent('nav', 'Navigation', 'navigationBar', { items: [{ id: 'home', values: { label: 'Home' } }] });
    return { ...base, screenTemplates: [{ name: 'Shell', slots: [{ name: contentSlot }], content: { [contentSlot]: [nav] } }] };
};

describe('when a template exposes the navigation items', () => {
    const exposed = applyToSession(openSession(documentWithNavigation()), exposePropertyEdit('Shell', 'nav', 'items', { operations: defaultCollectionOperations }), authoring, 'Expose');

    it('should record the exposure on the template', () => exposed.document.exposures.length.should.equal(1));
    it('should be one undo step', () => exposed.undoable.length.should.equal(1));

    const inspection = inspect(exposed.document, elementNodeId('nav'), usingScreen)!;
    const items = inspection.properties.find(property => property.descriptor.path === 'items')!;

    it('should let the screen using the template add its own items', () => items.operations!.should.include(CollectionOperation.Add));
    it('should offer the collection through the shared editor', () => (items.descriptor.valueType === PropertyValueType.Collection).should.be.true);

    const added = applyToSession(exposed, proposalToEdits('nav', items, { kind: 'add', item: { id: 'orders', label: 'Orders', destination: 'Orders', values: {} }, index: 0, items: [] })[0], usingScreen, 'Add item');

    it('should add the screen\'s item without touching the template', () => added.document.screenTemplates[0].content!.content.length.should.equal(1));
    it('should keep the template\'s fixed item and the screen\'s own, in order', () => {
        const after = inspect(added.document, elementNodeId('nav'), usingScreen)!.properties.find(property => property.descriptor.path === 'items')!;
        const { fixed, items: own } = toOrderedItems(after);
        [fixed.map(item => item.id), own.map(item => item.id)].should.deep.equal([['home'], ['orders']]);
    });
});

describe('when a template does not expose the navigation items', () => {
    const inspection = inspect(documentWithNavigation(), elementNodeId('nav'), usingScreen)!;
    const items = inspection.properties.find(property => property.descriptor.path === 'items')!;

    it('should not let the screen change them', () => items.editable.should.be.false);
    it('should have Scene refuse an instance edit', () => {
        const before = openSession(documentWithNavigation());
        const refused = applyToSession(before, { kind: SceneEditKind.AddCollectionItem, component: 'nav', path: 'items', item: { id: 'x', values: { label: 'X', destination: { screen: 'X' } } } }, usingScreen, 'Add item');
        (refused.document === before.document && refused.diagnostics.length > 0).should.be.true;
    });
});

describe('when a template stops exposing a property', () => {
    const exposed = applyToSession(openSession(documentWithNavigation()), exposePropertyEdit('Shell', 'nav', 'items'), authoring, 'Expose');
    const withdrawn = applyToSession(exposed, unexposePropertyEdit('Shell', 'nav', 'items'), authoring, 'Unexpose');

    it('should remove the exposure', () => withdrawn.document.exposures.length.should.equal(0));
});

describe('when describing an exposure', () => {
    it('should carry only the choices that were made', () => exposePropertyEdit('Shell', 'nav', 'title').property.should.deep.equal({ component: 'nav', path: 'title' }));
});

describe('when asking whether a template exposes a property', () => {
    const exposed = applyToSession(openSession(documentWithNavigation()), exposePropertyEdit('Shell', 'nav', 'items'), authoring, 'Expose');

    it('should say no before it is exposed', () => isExposed(documentWithNavigation(), 'Shell', 'nav', 'items').should.be.false);
    it('should say yes once it is', () => isExposed(exposed.document, 'Shell', 'nav', 'items').should.be.true);
    it('should say no for another property of the same component', () => isExposed(exposed.document, 'Shell', 'nav', 'title').should.be.false);
    it('should say no for another template', () => isExposed(exposed.document, 'Other', 'nav', 'items').should.be.false);
    it('should say no again once it is withdrawn', () => isExposed(applyToSession(exposed, unexposePropertyEdit('Shell', 'nav', 'items'), authoring, 'Unexpose').document, 'Shell', 'nav', 'items').should.be.false);
});
