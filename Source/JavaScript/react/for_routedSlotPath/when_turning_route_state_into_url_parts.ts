// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Opens } from '@cratis/scene.model';
import { PlacementDecision } from '@cratis/scene.engine';
import { parseRoutedSlotPath, parseSceneRouteQuery, routedSlotPath, sceneRouteQueryString, slotRouteFromPlacement } from '../routing/routedSlotPath';
import { withQueryParameter, withSlotClosed, withSlotOpened, withTabSelected } from '../routing/sceneRouteState';
import { emptySceneRouteState } from '../routing/SceneRouter';

describe('when turning route state into URL parts', () => {
    it('should write a routed slot\'s parameters in order, then its segment', () =>
        routedSlotPath({ parameters: { sku: 'NK 101', store: 'oslo' }, segment: 'set-product-price' }, ['store', 'sku']).should.equal('oslo/NK%20101/set-product-price'));
    it('should leave out a parameter without a value', () => routedSlotPath({ parameters: {} }, ['sku']).should.equal(''));
    it('should read the path back', () =>
        parseRoutedSlotPath('/oslo/NK%20101/set-product-price/', ['store', 'sku']).should.deep.equal({ parameters: { store: 'oslo', sku: 'NK 101' }, segment: 'set-product-price' }));
    it('should read a path with only parameters back', () => parseRoutedSlotPath('NK-101', ['sku']).should.deep.equal({ parameters: { sku: 'NK-101' } }));

    it('should write the filters\' values as a query string', () => sceneRouteQueryString({ q: 'kettle', status: 'onSale' }).should.equal('?q=kettle&status=onSale'));
    it('should write no query string without values', () => sceneRouteQueryString({}).should.equal(''));
    it('should read the query string back', () => parseSceneRouteQuery('?q=kettle&status=&x=a%20b').should.deep.equal({ q: 'kettle', x: 'a b' }));

    it('should turn a placement into a slot route', () => {
        const decision = {
            requested: Opens.Slot, resolved: Opens.Slot, slot: 'detail', routed: true, reason: '',
            route: { slot: 'detail', parameters: [{ name: 'sku', value: 'NK-101' }, { name: 'store' }], segment: 'product-details' },
            runDirectly: { available: true, missing: [], reason: '' }, slots: [],
        } as PlacementDecision;
        slotRouteFromPlacement(decision, 'ProductDetails')!.should.deep.equal({ screen: 'ProductDetails', parameters: { sku: 'NK-101' }, segment: 'product-details' });
    });

    it('should change the state without touching what it does not change', () => {
        const opened = withSlotOpened(emptySceneRouteState, 'detail', { screen: 'A', parameters: {} });
        const tabbed = withTabSelected(withQueryParameter(opened, 'q', 'kettle'), 'detailTabs', 'pricing');
        [withSlotClosed(tabbed, 'detail'), withQueryParameter(tabbed, 'q', '').query].should.deep.equal([
            { slots: {}, tabs: { detailTabs: 'pricing' }, query: { q: 'kettle' } },
            {},
        ]);
    });
});
