// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ActionSlice, InputSourceKind } from '@cratis/scene.engine';
import { directPayload } from '../outlets/useOutletActionActivation';

const row = { id: 'NK-101', name: 'Nordic Kettle', price: 49, supplierEmail: 'buyer@example.com' };
const slice: ActionSlice = {
    id: 'Catalog.Products.WithdrawProduct',
    command: 'WithdrawProduct',
    inputs: [{ name: 'id', source: InputSourceKind.DataContext }, { name: 'store', source: InputSourceKind.Route }, { name: 'reason' }],
};

describe('when running an action directly', () => {
    describe('and its slice is not known', () => {
        it('should send nothing of the selected row', () => directPayload(undefined, row, { store: 'oslo' }).should.deep.equal({}));
    });

    describe('and its slice is known', () => {
        it('should send only the inputs its command takes, from the row and the route', () =>
            directPayload(slice, row, { store: 'oslo' }).should.deep.equal({ id: 'NK-101', store: 'oslo' }));
    });
});
