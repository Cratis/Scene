// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { placeInOutlet } from '../navigation/placeInOutlet';

describe('when placing screens in nested outlets', () => {
    const owners = { detail: 'Orders', line: 'OrderDetails' };
    const destinations = [{ screen: 'OrderDetails', outlet: 'detail' }];
    const start = { screen: 'Orders', parameters: {} };

    it('should keep the primary screen and place into its outlet', () =>
        placeInOutlet(start, 'OrderDetails', 'detail', owners).should.deep.equal({ primary: 'Orders', outlets: { detail: 'OrderDetails' } }));

    it('should place the declaring screen first when it is not on the page', () =>
        placeInOutlet(start, 'OrderLine', 'line', owners, destinations).should.deep.equal({ primary: 'Orders', outlets: { detail: 'OrderDetails', line: 'OrderLine' } }));

    it('should drop placements whose declaring screen left the page', () =>
        placeInOutlet({ ...start, outlets: { detail: 'OrderDetails', line: 'OrderLine' } }, 'Invoice', 'detail', owners)
            .should.deep.equal({ primary: 'Orders', outlets: { detail: 'Invoice' } }));

    it('should replace the primary region for an outlet no screen declares', () =>
        placeInOutlet({ ...start, outlets: { detail: 'OrderDetails' } }, 'Customers', 'content', owners).should.deep.equal({ primary: 'Customers', outlets: {} }));

    it('should stop on a model whose screens host each other', () => {
        const cyclic = { a: 'B', b: 'A' };
        const result = placeInOutlet({ screen: 'Start', parameters: {} }, 'A', 'a', cyclic, [{ screen: 'A', outlet: 'a' }, { screen: 'B', outlet: 'b' }]);
        result.primary!.should.equal('Start');
    });
});
