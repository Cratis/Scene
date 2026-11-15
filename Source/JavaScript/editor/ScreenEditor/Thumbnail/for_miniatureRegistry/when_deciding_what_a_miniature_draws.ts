// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { declarationComponents } from '../../Surface/DesignTime/designTimeSamples';
import { overlayKinds } from '../../Surface/DesignTime/overlayKinds';
import { drawsNothingInAMiniature } from '../miniatureRegistry';

// A screen saved with a dialog on it put a window over the whole board, because the miniature drew what the dialog opens at the size of the page.
describe('when deciding what a miniature draws', () => {
    for (const name of Object.keys(overlayKinds))
        it(`should draw nothing for the overlay ${name}, from any package`, () => {
            drawsNothingInAMiniature(name).should.be.true;
            drawsNothingInAMiniature(`PrimeReact:${name}`).should.be.true;
        });

    for (const name of declarationComponents)
        it(`should draw nothing for the declaration ${name}`, () => drawsNothingInAMiniature(name).should.be.true);

    for (const name of ['button', 'text', 'card', 'table', 'navigationBar', 'PrimeReact:inputText'])
        it(`should draw ${name}`, () => drawsNothingInAMiniature(name).should.be.false);
});
