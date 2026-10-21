// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { ApplicationStructure, NavigationModel, NavigationRegionKind } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { coreComponents } from '../core';
import { NavigationRegionView } from '../navigation/region/NavigationRegionView';
import { SceneNavigationHost } from '../navigation/SceneNavigationHost';
import { SceneNavigationModel } from '../navigation/region/SceneNavigationModel';

const structure = { modules: [{ id: 'warehouse', name: 'Warehouse', features: [{ id: 'stock', name: 'Stock', features: [], slices: [] }], slices: [] }] } as unknown as ApplicationStructure;
const navigation: NavigationModel = {
    application: { regions: [{ region: NavigationRegionKind.Sidebar, items: [
        { id: 'stock', title: 'Stock', icon: 'box', target: { module: 'warehouse', feature: 'stock' } },
        { id: 'ghost', title: 'Ghost', icon: 'box', target: { module: 'warehouse', feature: 'ghost' } },
    ] }] },
    modules: [],
};

// The slim and compact rails hide an item's label and show only its icon; the link itself still says what it is (Scene#229).
describe('when a rail hides the label', () => {
    afterEach(cleanup);
    beforeEach(() => {
        const model: SceneNavigationModel = { structure: new ApplicationStructureIndex(structure), navigation };
        render(
            <SceneNavigationHost navigationModel={model} initialScreen='warehouse.stock' registry={coreComponents} screens={{ 'warehouse.stock': { id: 'w', componentName: 'core:text', properties: { text: 'w' }, slots: {} } as never }}
                frame={content => <div><NavigationRegionView region={NavigationRegionKind.Sidebar} /><main>{content}</main></div>} />
        );
    });

    const link = (id: string) => document.querySelector(`[data-scene-nav-item="${id}"] > [data-scene-nav-link]`)!;
    // A rail hides the label span (display:none in the blueprint's layout.css); hide it the same way here.
    const hideLabels = () => document.querySelectorAll<HTMLElement>('[data-scene-nav-link] > span:not([aria-hidden])').forEach(span => { span.style.display = 'none'; });

    it('should give the link the title as its tooltip', () => link('stock').getAttribute('title')!.should.equal('Stock'));
    it('should name an item without a target in its tooltip', () => link('ghost').getAttribute('title')!.should.equal('Ghost: this item has no target to go to.'));
    it('should keep the link findable by the title when the label is hidden', () => {
        hideLabels();
        (screen.getByRole('link', { name: 'Stock' }) === link('stock')).should.equal(true);
    });
});
