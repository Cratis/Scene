// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { screensOfDocuments } from '../screensOfDocuments';

describe('when reading the screens of saved documents', () => {
    const screens = screensOfDocuments([
        JSON.stringify({ screens: [{ name: 'Orders', slotContent: { sidebar: [{ id: 'a' }] } }, { name: 'Customers' }] }),
        JSON.stringify({ screens: [{ name: 'Tickets' }] }),
        'not json',
        undefined,
        null,
        JSON.stringify({ screens: 'nope' }),
        JSON.stringify({ screens: [{ id: 'no name' }] }),
    ]);

    it('should list the screens of every document in order', () => screens.map(screen => screen.name).should.deep.equal(['Orders', 'Customers', 'Tickets']));
    it('should keep what the screen places in its slots', () => Object.keys(screens[0].slotContent!).should.deep.equal(['sidebar']));
});
