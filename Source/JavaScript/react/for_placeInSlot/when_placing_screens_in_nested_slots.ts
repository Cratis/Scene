// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { shellSlotOwner } from '../navigation/collectSlotOwners';
import { placeInSlot } from '../navigation/placeInSlot';

describe('when placing screens in nested slots', () => {
    const owners = { detail: 'Orders', line: 'OrderDetails' };
    const destinations = [{ screen: 'OrderDetails', slot: 'detail' }];
    const start = { screen: 'Orders', parameters: {} };

    it('should keep the primary screen and place into its slot', () =>
        placeInSlot(start, 'OrderDetails', 'detail', owners).should.deep.equal({ primary: 'Orders', slots: { detail: 'OrderDetails' } }));

    it('should place the declaring screen first when it is not on the page', () =>
        placeInSlot(start, 'OrderLine', 'line', owners, destinations).should.deep.equal({ primary: 'Orders', slots: { detail: 'OrderDetails', line: 'OrderLine' } }));

    it('should drop placements whose declaring screen left the page', () =>
        placeInSlot({ ...start, slots: { detail: 'OrderDetails', line: 'OrderLine' } }, 'Invoice', 'detail', owners)
            .should.deep.equal({ primary: 'Orders', slots: { detail: 'Invoice' } }));

    it('should replace the primary region for a slot no screen declares', () =>
        placeInSlot({ ...start, slots: { detail: 'OrderDetails' } }, 'Customers', 'content', owners).should.deep.equal({ primary: 'Customers', slots: {} }));

    it('should stop on a model whose screens host each other', () => {
        const cyclic = { a: 'B', b: 'A' };
        const result = placeInSlot({ screen: 'Start', parameters: {} }, 'A', 'a', cyclic, [{ screen: 'A', slot: 'a' }, { screen: 'B', slot: 'b' }]);
        result.primary!.should.equal('Start');
    });

    describe('and the slot is one the shell declares', () => {
        const shellOwners = { ...owners, side: shellSlotOwner };

        it('should keep the primary screen and place the screen beside it', () =>
            placeInSlot(start, 'Articles', 'side', shellOwners).should.deep.equal({ primary: 'Orders', slots: { side: 'Articles' } }));

        it('should keep the side screen when the primary screen changes', () =>
            placeInSlot({ ...start, slots: { side: 'Articles' } }, 'Customers', 'content', shellOwners).should.deep.equal({ primary: 'Customers', slots: { side: 'Articles' } }));

        it('should replace the side screen when another one is placed there', () =>
            placeInSlot({ ...start, slots: { side: 'Articles' } }, 'Invoice', 'side', shellOwners).should.deep.equal({ primary: 'Orders', slots: { side: 'Invoice' } }));

        it('should keep the slots of the screen shown beside the primary one', () =>
            placeInSlot({ ...start, slots: { side: 'OrderDetails' } }, 'OrderLine', 'line', shellOwners, [{ screen: 'OrderDetails', slot: 'side' }])
                .should.deep.equal({ primary: 'Orders', slots: { side: 'OrderDetails', line: 'OrderLine' } }));
    });
});
