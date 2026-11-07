// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { afterEach } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { ExternalComponent, SceneElement } from '@cratis/scene.model';
import { coreComponents } from '../core';
import { SceneElementView } from '../SceneElementView';
import { SceneSlotContext } from '../navigation/SceneSlotContext';
import { usePageRouteValues } from '../outlets/usePageRouteValues';
import { SceneRouterProvider, useSceneSlotRouteValues } from '../routing';

const element = (id: string, componentName: string, properties: Record<string, unknown> = {}, slots: Record<string, SceneElement[]> = {}) =>
    ({ id, componentName, properties, slots }) as unknown as ExternalComponent;

function RouteValues() {
    const page = usePageRouteValues();
    const slot = useSceneSlotRouteValues();
    return <output data-page={JSON.stringify(page)} data-slot={JSON.stringify(slot ?? null)} />;
}

const registry = { ...coreComponents, 'test:routeValues': RouteValues };
const page = element('page', 'core:section', {}, {
    content: [
        element('detail', 'core:slot', { name: 'detail', role: 'pane', routedBy: ['sku'] }),
        element('compare', 'core:slot', { name: 'compare', role: 'pane', routedBy: ['sku'] }),
        element('main', 'core:slot', { name: 'main' }),
        element('outside', 'test:routeValues'),
    ],
});
const screens = { ProductDetails: element('details', 'test:routeValues') };

const valuesIn = (selector: string) => {
    const output = document.querySelector(`${selector} output`)!;
    return [JSON.parse(output.getAttribute('data-page')!), JSON.parse(output.getAttribute('data-slot')!)];
};

describe('when a routed slot shows a screen', () => {
    afterEach(cleanup);

    beforeEach(() => render(<SceneRouterProvider initialState={{
        slots: {
            detail: { screen: 'ProductDetails', parameters: { sku: 'NK-101' } },
            compare: { screen: 'ProductDetails', parameters: { sku: 'NK-202' } },
        },
        tabs: {},
        query: {},
    }}>
        <SceneSlotContext.Provider value={{ screens, registry }}>
            <SceneElementView element={page as never} registry={registry} />
        </SceneSlotContext.Provider>
    </SceneRouterProvider>));

    it('should give the screen in the first slot the values it was opened with', () =>
        valuesIn('[data-scene-slot="detail"]').should.deep.equal([{ sku: 'NK-101' }, { sku: 'NK-101' }]));
    it('should give the screen in the second slot the values it was opened with', () =>
        valuesIn('[data-scene-slot="compare"]').should.deep.equal([{ sku: 'NK-202' }, { sku: 'NK-202' }]));
    it('should give nothing of a slot to what is drawn outside one', () => {
        const outside = [...document.querySelectorAll('output')].find(output => output.closest('[data-scene-slot]') === null)!;
        outside.getAttribute('data-slot')!.should.equal('null');
    });
});
