// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { shellOutletOwner } from '../navigation/collectOutletOwners';
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

    describe('and the outlet is one the shell declares', () => {
        const shellOwners = { ...owners, side: shellOutletOwner };

        it('should keep the primary screen and place the screen beside it', () =>
            placeInOutlet(start, 'Articles', 'side', shellOwners).should.deep.equal({ primary: 'Orders', outlets: { side: 'Articles' } }));

        it('should keep the side screen when the primary screen changes', () =>
            placeInOutlet({ ...start, outlets: { side: 'Articles' } }, 'Customers', 'content', shellOwners).should.deep.equal({ primary: 'Customers', outlets: { side: 'Articles' } }));

        it('should replace the side screen when another one is placed there', () =>
            placeInOutlet({ ...start, outlets: { side: 'Articles' } }, 'Invoice', 'side', shellOwners).should.deep.equal({ primary: 'Orders', outlets: { side: 'Invoice' } }));

        it('should keep the outlets of the screen shown beside the primary one', () =>
            placeInOutlet({ ...start, outlets: { side: 'OrderDetails' } }, 'OrderLine', 'line', shellOwners, [{ screen: 'OrderDetails', outlet: 'side' }])
                .should.deep.equal({ primary: 'Orders', outlets: { side: 'OrderDetails', line: 'OrderLine' } }));
    });
});
