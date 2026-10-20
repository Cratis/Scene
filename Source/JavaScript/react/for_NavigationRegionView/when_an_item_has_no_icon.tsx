// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render } from '@testing-library/react';
import { afterEach } from 'vitest';
import { ApplicationStructure, NavigationModel, NavigationRegionKind } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { coreComponents } from '../core';
import { NavigationRegionView } from '../navigation/region/NavigationRegionView';
import { SceneNavigationHost } from '../navigation/SceneNavigationHost';
import { SceneNavigationModel } from '../navigation/region/SceneNavigationModel';

const structure = { modules: [{ id: 'warehouse', name: 'Warehouse', features: [], slices: [] }] } as unknown as ApplicationStructure;
const navigation: NavigationModel = {
    application: { regions: [{ region: NavigationRegionKind.Sidebar, items: [
        { id: 'plain', title: 'Stock levels', target: { module: 'warehouse' } },
        { id: 'drawn', title: 'Adjustments', icon: 'pi:home', target: { module: 'warehouse' } },
    ] }] },
    modules: [],
};

// A rail hides the label and shows the icon: an entry with no icon is marked so the stylesheet can keep its label (Scene#230).
describe('when an item has no icon', () => {
    afterEach(cleanup);
    beforeEach(() => {
        const model: SceneNavigationModel = { structure: new ApplicationStructureIndex(structure), navigation };
        render(<SceneNavigationHost navigationModel={model} initialScreen='warehouse' registry={coreComponents} screens={{ warehouse: { id: 'w', componentName: 'core:text', properties: { text: 'w' }, slots: {} } as never }}
            frame={content => <div><NavigationRegionView region={NavigationRegionKind.Sidebar} renderIcon={icon => <i className={icon} />} /><main>{content}</main></div>} />);
    });

    const item = (id: string) => document.querySelector(`[data-scene-nav-item="${id}"]`)!;

    it('should mark the item without an icon', () => item('plain').getAttribute('data-scene-iconless')!.should.equal('true'));
    it('should not mark an item that has one', () => (item('drawn').getAttribute('data-scene-iconless') === null).should.be.true);
});
