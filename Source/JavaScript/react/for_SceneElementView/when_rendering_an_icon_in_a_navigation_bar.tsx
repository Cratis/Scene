// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { expect } from 'chai';
import { render, screen } from '@testing-library/react';
import {
    CollectionOperation, EditingScopeKind, ExternalComponent, HorizontalAlignment, PackageKind, SceneDocument, SceneEditKind,
    ScenePackage, VerticalAlignment, Visibility,
} from '@cratis/scene.model';
import {
    applyEdit, createDescriptorCatalog, EffectiveIconCatalog, resolveEffectiveConfiguration, resolveIconLibraries, resolveTemplateChain,
} from '@cratis/scene.engine';
import { IconAdapterProvider, createIconAdapterRegistry } from '../icons';
import { SceneElementView } from '../SceneElementView';
import { coreComponents, corePackage } from '../core';

const library = 'acme.icons';

const iconPackage: ScenePackage = {
    name: library, version: '1.0.0', kind: PackageKind.IconLibrary, dependencies: [], components: [], layouts: [], screenTemplates: [],
    dialogTemplates: [], themes: [], iconLibrary: { variants: [], renderers: ['react'] },
};

const navigationBar: ExternalComponent = {
    id: 'navigation', name: 'navigation', componentName: 'core:navigationBar', slots: {},
    properties: { items: [{ id: 'home', label: 'Home' }] },
    visibility: Visibility.Visible, isEnabled: true, opacity: 1, size: {}, zIndex: 0, minimumSize: {}, maximumSize: {},
    margin: { left: 0, top: 0, right: 0, bottom: 0 },
    horizontalAlignment: HorizontalAlignment.Stretch, verticalAlignment: VerticalAlignment.Stretch,
};

const document: SceneDocument = {
    layouts: [{ name: 'Shell', slots: [{ name: 'content' }] }],
    screenTemplates: [{ name: 'Module', fitsSlot: 'content', slots: [{ name: 'body' }], content: { chrome: [navigationBar] } }],
    dialogTemplates: [],
    screens: [{ name: 'Invoices', layout: 'Shell', screenTemplate: 'Module', forms: [], contributions: [], slotContent: {} }],
    exposures: [{ owner: 'Module', properties: [{ component: 'navigation', path: 'items', operations: [CollectionOperation.Add] }] }],
    instanceContributions: [],
};

const catalog = createDescriptorCatalog(corePackage.descriptors);
const scope = { kind: EditingScopeKind.Screen, name: 'Invoices' };

describe('when rendering an icon in a navigation bar', () => {
    let configured: SceneDocument;

    beforeEach(async () => {
        const icons = new EffectiveIconCatalog(resolveIconLibraries([library], [iconPackage]), [
            { library, loadEntries: async () => [{ key: 'trash', name: 'Trash', categories: ['Actions'] }] },
        ]);
        await icons.load();

        const outcome = applyEdit(
            document,
            { kind: SceneEditKind.AddCollectionItem, component: 'navigation', path: 'items', item: { id: 'bin', values: { label: 'Bin', icon: { library, key: 'trash' }, destination: { screen: 'Bin' } } } },
            { catalog, scope, iconCatalog: icons }
        );
        expect(outcome.diagnostics).to.deep.equal([]);
        outcome.applied.should.equal(true);
        configured = outcome.model;
    });

    const view = () => {
        const chain = resolveTemplateChain(configured, scope);
        const configuration = resolveEffectiveConfiguration(chain, configured.instanceContributions, catalog);
        return <SceneElementView element={navigationBar} registry={coreComponents} resolveBinding={() => undefined} configuration={configuration} />;
    };

    it('should draw the contributed icon through the adapter for its library', async () => {
        const adapters = createIconAdapterRegistry([{ library, loadGlyph: () => () => <svg data-testid="trash-glyph" /> }]);
        render(<IconAdapterProvider registry={adapters}>{view()}</IconAdapterProvider>);
        expect(await screen.findByTestId('trash-glyph')).to.have.property('tagName');
    });

    it('should show the label alone when no adapters are in scope', () => {
        const { container } = render(view());
        expect(container.querySelector('[data-icon-library]')).to.equal(null);
        expect(container.querySelector('[data-scene-item="bin"]')!.textContent).to.equal('Bin');
    });
});
