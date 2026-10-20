// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { expect } from 'chai';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { ApplicationStructure, NavigationModel, NavigationRegionKind } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { coreComponents } from '../core';
import { IconAdapterProvider, createIconAdapterRegistry } from '../icons';
import { adapterFor } from '../icons/for_SceneIcon/given/iconAdapters';
import { NavigationRegionView } from '../navigation/region/NavigationRegionView';
import { SceneNavigationHost } from '../navigation/SceneNavigationHost';
import { SceneNavigationModel } from '../navigation/region/SceneNavigationModel';

const structure = { modules: [{ id: 'warehouse', name: 'Warehouse', features: [], slices: [] }] } as unknown as ApplicationStructure;
const navigation: NavigationModel = {
    application: { regions: [{ region: NavigationRegionKind.Sidebar, items: [
        { id: 'stock', title: 'Warehouse', icon: 'box', target: { module: 'warehouse' } },
    ] }] },
    modules: [],
};

// Screenplay names an icon bare (`icon box`): the rail draws it from the library the built-in icons come from instead of leaving a blank tile.
describe('when an item names its icon bare', () => {
    afterEach(cleanup);
    beforeEach(() => {
        const model: SceneNavigationModel = { structure: new ApplicationStructureIndex(structure), navigation };
        const adapters = createIconAdapterRegistry([adapterFor('Cratis.Icons.Lucide', { box: () => <svg data-testid='lucide-box' /> })]);
        render(
            <IconAdapterProvider registry={adapters}>
                <SceneNavigationHost navigationModel={model} initialScreen='warehouse' registry={coreComponents} screens={{ warehouse: { id: 'w', componentName: 'core:text', properties: { text: 'w' }, slots: {} } as never }}
                    frame={content => <div><NavigationRegionView region={NavigationRegionKind.Sidebar} /><main>{content}</main></div>} />
            </IconAdapterProvider>
        );
    });

    it('should draw the glyph of that key from the Lucide library', async () => expect(await screen.findByTestId('lucide-box')).to.exist);
    it('should not mark the item as having no icon', () => (document.querySelector('[data-scene-nav-item="stock"]')!.getAttribute('data-scene-iconless') === null).should.be.true);
});
