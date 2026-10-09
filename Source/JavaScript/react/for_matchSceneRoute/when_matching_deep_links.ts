// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationKind } from '@cratis/scene.model';
import { matchSceneRoute } from '../navigation/matchSceneRoute';
import { sceneRoutesFrom } from '../navigation/sceneRoutesFrom';

describe('when matching deep links', () => {
    const routes = sceneRoutesFrom(['Orders', 'NewOrder'], [
        { screen: 'OrderDetails', route: 'orders/{orderId}', outlet: 'detail' },
        { screen: 'NewOrder', route: 'orders/new' },
        { module: 'finance', feature: 'ledger', slice: 'Ledger' },
        { kind: DestinationKind.Dialog, dialog: 'Confirm', route: 'confirm' },
    ]);

    it('should capture decoded path parameters and query parameters', () =>
        matchSceneRoute('orders/A%2FB%201?view=lines', routes)!.should.deep.equal({
            route: { route: 'orders/{orderId}', screen: 'OrderDetails', outlet: 'detail' },
            parameters: { view: 'lines', orderId: 'A/B 1' },
        }));

    it('should prefer a literal route over a parameter', () => matchSceneRoute('orders/new', routes)!.route.screen.should.equal('NewOrder'));
    it('should match identity routes and screen names', () => {
        matchSceneRoute('finance/ledger/Ledger', routes)!.route.screen.should.equal('Ledger');
        matchSceneRoute('/Orders/', routes)!.route.screen.should.equal('Orders');
    });

    it('should not route to dialogs', () => (matchSceneRoute('confirm', routes) === undefined).should.equal(true));
    it('should match nothing for an unknown URL', () => (matchSceneRoute('orders/1/lines', routes) === undefined).should.equal(true));
});
