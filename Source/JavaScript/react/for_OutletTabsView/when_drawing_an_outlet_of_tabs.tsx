// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { OutletLevel, OutletLevelKind } from '@cratis/scene.engine';
import { ExternalComponent, OutletItemKind, OutletKind } from '@cratis/scene.model';
import { coreComponents } from '../core';
import { SceneElementView } from '../SceneElementView';
import { SceneSlotContext } from '../navigation/SceneSlotContext';
import { SceneOutletsProvider } from '../outlets/SceneOutletsContext';
import { SceneRouterProvider } from '../routing';

const element = (id: string, componentName: string, properties: Record<string, unknown>) => ({ id, componentName, properties, slots: {} }) as unknown as ExternalComponent;

const screens = {
    ProductOverview: element('overview', 'core:text', { text: 'Overview of the product' }),
    ProductPricing: element('pricing', 'core:text', { text: 'Pricing of the product' }),
};

const chain: OutletLevel[] = [
    {
        kind: OutletLevelKind.Template, name: 'ListPage',
        outlets: [{ name: 'detailTabs', kind: OutletKind.Tabs, slot: 'detail', defaults: [{ kind: OutletItemKind.Tab as const, id: 'overview', title: 'Overview', shows: 'ProductOverview' }] }],
    },
    { kind: OutletLevelKind.Feature, name: 'Products' },
];
const contributors: OutletLevel[] = [{
    kind: OutletLevelKind.Feature, name: 'Pricing',
    contributions: [{ outlet: 'detailTabs', items: [{ kind: OutletItemKind.Tab as const, id: 'pricing', title: 'Pricing', shows: 'ProductPricing' }] }],
}];

describe('when drawing an outlet of tabs', () => {
    afterEach(cleanup);

    beforeEach(() => {
        render(<SceneRouterProvider>
            <SceneSlotContext.Provider value={{ screens, registry: coreComponents }}>
                <SceneOutletsProvider value={{ chain, contributors }}>
                    <SceneElementView element={element('tabs', 'core:outletItems', { name: 'detailTabs' }) as never} registry={coreComponents} />
                </SceneOutletsProvider>
            </SceneSlotContext.Provider>
        </SceneRouterProvider>);
    });

    it('should draw the defaults and the contributed tabs', () => screen.getAllByRole('tab').map(tab => tab.textContent).should.deep.equal(['Overview', 'Pricing']));
    it('should choose the first tab', () => screen.getByRole('tab', { name: 'Overview' }).getAttribute('aria-selected')!.should.equal('true'));
    it('should show the chosen tab\'s screen in the slot the outlet owns', () =>
        [screen.getByRole('tabpanel').getAttribute('data-scene-slot'), screen.getByRole('tabpanel').getAttribute('data-scene-slot-screen')].should.deep.equal(['detail', 'ProductOverview']));

    describe('and another tab is chosen', () => {
        beforeEach(() => { fireEvent.click(screen.getByRole('tab', { name: 'Pricing' })); });

        it('should show its screen', () => screen.getByRole('tabpanel').getAttribute('data-scene-slot-screen')!.should.equal('ProductPricing'));
        it('should mark it chosen', () => screen.getByRole('tab', { name: 'Pricing' }).getAttribute('aria-selected')!.should.equal('true'));
    });
});
