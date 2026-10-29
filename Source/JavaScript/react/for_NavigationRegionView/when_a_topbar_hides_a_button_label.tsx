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

const structure = { modules: [{ id: 'warehouse', name: 'Warehouse', features: [{ id: 'stock', name: 'Stock', features: [{ id: 'levels', name: 'Levels', features: [], slices: [{ id: 'RegisterSku', name: 'Register SKU', kind: 'StateChange', command: 'RegisterSku' }] }], slices: [] }], slices: [] }] } as unknown as ApplicationStructure;
const navigation: NavigationModel = {
    application: { regions: [{ region: NavigationRegionKind.Topbar, items: [{ id: 'stock', title: 'Stock', target: { module: 'warehouse', feature: 'stock' } }], buttons: [
        { id: 'registerSku', title: 'Register SKU', icon: 'box', slice: 'warehouse.stock.levels.RegisterSku' },
    ] }] },
    modules: [],
};

// A compact topbar and a slim rail hide the label of an application toolbar button and show only its icon; the button itself still says what it is.
describe('when a topbar hides a button label', () => {
    afterEach(cleanup);
    beforeEach(() => {
        const model: SceneNavigationModel = { structure: new ApplicationStructureIndex(structure), navigation };
        render(
            <SceneNavigationHost navigationModel={model} initialScreen='warehouse.stock' registry={coreComponents} screens={{ 'warehouse.stock': { id: 'w', componentName: 'core:text', properties: { text: 'w' }, slots: {} } as never }}
                frame={content => <div><NavigationRegionView region={NavigationRegionKind.Topbar} /><main>{content}</main></div>} />
        );
    });

    const button = () => document.querySelector('[data-scene-nav-button="registerSku"]')!;
    const hideLabels = () => document.querySelectorAll<HTMLElement>('[data-scene-nav-button] > span:not([aria-hidden])').forEach(span => { span.style.display = 'none'; });

    it('should give the button the title as its tooltip', () => button().getAttribute('title')!.should.equal('Register SKU'));
    it('should give the button the title as its aria label', () => button().getAttribute('aria-label')!.should.equal('Register SKU'));
    it('should keep the button findable by the title when the label is hidden', () => {
        hideLabels();
        (screen.getByRole('button', { name: 'Register SKU' }) === button()).should.equal(true);
    });
});
