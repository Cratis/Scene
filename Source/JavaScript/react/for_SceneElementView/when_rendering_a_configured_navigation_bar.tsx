// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { expect } from 'chai';
import { render } from '@testing-library/react';
import {
    CollectionOperation, EditingScopeKind, ExternalComponent, HorizontalAlignment, ProvenanceKind, SceneDocument, SceneEdit,
    SceneEditKind, VerticalAlignment, Visibility,
} from '@cratis/scene.model';
import {
    applyEdit, createDescriptorCatalog, EditingContext, inspect, resolveEffectiveConfiguration, resolveTemplateChain,
} from '@cratis/scene.engine';
import { SceneElementView } from '../SceneElementView';
import { coreComponents, corePackage } from '../core';

const navigationBar: ExternalComponent = {
    id: 'navigation', name: 'navigation', componentName: 'core:navigationBar', slots: {},
    properties: { title: 'Main', items: [{ id: 'home', label: 'Home', destination: { screen: 'Home' } }] },
    visibility: Visibility.Visible, isEnabled: true, opacity: 1, size: {}, zIndex: 0, minimumSize: {}, maximumSize: {},
    margin: { left: 0, top: 0, right: 0, bottom: 0 },
    horizontalAlignment: HorizontalAlignment.Stretch, verticalAlignment: VerticalAlignment.Stretch,
};

function createDocument(): SceneDocument {
    const screen = (name: string) => ({ name, layout: 'Shell', screenTemplate: 'Module', forms: [], contributions: [], slotContent: {} });
    return {
        layouts: [{ name: 'Shell', slots: [{ name: 'content' }] }],
        screenTemplates: [{ name: 'Module', fitsSlot: 'content', slots: [{ name: 'body' }], content: { chrome: [navigationBar] } }],
        dialogTemplates: [],
        screens: [screen('Invoices'), screen('Customers')],
        exposures: [{
            owner: 'Module',
            properties: [{
                component: 'navigation', path: 'items', label: 'Additional items',
                operations: [CollectionOperation.Add, CollectionOperation.Remove, CollectionOperation.Reorder, CollectionOperation.EditFields],
            }],
        }],
        instanceContributions: [],
    };
}

const catalog = createDescriptorCatalog(corePackage.descriptors);
const contextFor = (name: string): EditingContext => ({ catalog, scope: { kind: EditingScopeKind.Screen, name } });

function configure(document: SceneDocument, name: string, edits: SceneEdit[]): SceneDocument {
    return edits.reduce((current, edit) => {
        const outcome = applyEdit(current, edit, contextFor(name));
        outcome.applied.should.equal(true);
        return outcome.model;
    }, document);
}

function renderFor(document: SceneDocument, name: string) {
    const chain = resolveTemplateChain(document, { kind: EditingScopeKind.Screen, name });
    const configuration = resolveEffectiveConfiguration(chain, document.instanceContributions, catalog);
    return render(<SceneElementView element={navigationBar} registry={coreComponents} resolveBinding={() => undefined} configuration={configuration} />);
}

const labels = (container: HTMLElement) => [...container.querySelectorAll('button')].map(button => button.textContent);

describe('when rendering a configured navigation bar', () => {
    const configured = configure(createDocument(), 'Invoices', [
        { kind: SceneEditKind.AddCollectionItem, component: 'navigation', path: 'items', item: { id: 'reports', values: { label: 'Reports', icon: { library: 'lucide', key: 'chart' }, destination: { screen: 'Reports' } } } },
        { kind: SceneEditKind.AddCollectionItem, component: 'navigation', path: 'items', item: { id: 'archive', values: { label: 'Archive', destination: { screen: 'Archive' } } } },
        { kind: SceneEditKind.ReorderCollectionItem, component: 'navigation', path: 'items', itemId: 'archive', index: 0 },
    ]);

    it('should keep the fixed Home item first and follow it with the screen\'s own items in their order', () => {
        const { container } = renderFor(configured, 'Invoices');
        labels(container).should.deep.equal(['Home', 'Archive', 'Reports']);
    });

    it('should carry an item\'s icon reference to the node', () => {
        const { container } = renderFor(configured, 'Invoices');
        const reports = container.querySelector('[data-scene-item="reports"]')!;
        reports.getAttribute('data-scene-icon-library')!.should.equal('lucide');
        reports.getAttribute('data-scene-icon-key')!.should.equal('chart');
    });

    it('should leave another screen on the same template with only Home', () => {
        const { container } = renderFor(configured, 'Customers');
        labels(container).should.deep.equal(['Home']);
    });

    it('should render the template as authored when no configuration is given', () => {
        const { container } = render(<SceneElementView element={navigationBar} registry={coreComponents} resolveBinding={() => undefined} />);
        labels(container).should.deep.equal(['Home']);
    });

    it('should show the editor the same items the runtime renders', () => {
        const inspection = inspect(configured, 'element:navigation', contextFor('Invoices'))!;
        inspection.provenance.kind.should.equal(ProvenanceKind.ConfigurableInherited);

        const items = inspection.properties.find(property => property.descriptor.path === 'items')!.items!;
        items.map(item => item.values.label).should.deep.equal(['Home', 'Archive', 'Reports']);
        items.map(item => item.editable).should.deep.equal([false, true, true]);
    });

    it('should not change the template itself', () => {
        const template = configured.screenTemplates[0].content!.chrome[0] as ExternalComponent;
        (template.properties.items as unknown[]).should.have.length(1);
        expect(configured.instanceContributions).to.have.length(1);
    });

    it('should let a screen remove its own item but never the fixed one', () => {
        const withoutArchive = applyEdit(configured, { kind: SceneEditKind.RemoveCollectionItem, component: 'navigation', path: 'items', itemId: 'archive' }, contextFor('Invoices'));
        withoutArchive.applied.should.equal(true);
        applyEdit(configured, { kind: SceneEditKind.RemoveCollectionItem, component: 'navigation', path: 'items', itemId: 'home' }, contextFor('Invoices')).applied.should.equal(false);
    });
});
