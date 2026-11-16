// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isScreenplayIdentifier } from '../isScreenplayIdentifier';

describe('when checking whether a name is a Screenplay identifier', () => {
    ['Orders', '_x', 'Order_List2'].forEach(name => it(`should accept ${JSON.stringify(name)}`, () => isScreenplayIdentifier(name).should.be.true));
    ['', 'Bad name', '1Orders', 'Order-List', 'Ørders', 'Orders\nbind X to y', 'Orders\n', 'Orders;'].forEach(name => it(`should refuse ${JSON.stringify(name)}`, () => isScreenplayIdentifier(name).should.be.false));
});
