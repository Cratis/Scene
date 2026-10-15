// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { preview } from './when_previewing_a_module';

describe('when leaving a preview', () => {
    afterEach(cleanup);

    describe('and Escape is pressed on the page', () => {
        it('should ask the host to exit', () => {
            let exits = 0;
            render(preview({ onExit: () => exits++ }));
            fireEvent.keyDown(window, { key: 'Escape' });
            exits.should.equal(1);
        });
    });

    describe('and Escape is pressed with a dialog open', () => {
        let exits: number;
        beforeEach(() => {
            exits = 0;
            render(preview({ target: { slice: 'sales.orders.PlaceOrder' }, onExit: () => exits++ }));
            fireEvent.keyDown(document.querySelector('.scene-slice-dialog')!, { key: 'Escape' });
        });

        it('should close the dialog and not exit', () => [screen.queryByRole('dialog'), exits].should.deep.equal([null, 0]));

        describe('and Escape is pressed again', () => {
            beforeEach(() => { fireEvent.keyDown(window, { key: 'Escape' }); });

            it('should exit', () => exits.should.equal(1));
        });
    });

    describe('and the host gives no way out', () => {
        it('should do nothing on Escape', () => {
            render(preview());
            fireEvent.keyDown(window, { key: 'Escape' });
            (document.querySelector('.layout-topbar') !== null).should.equal(true);
        });
    });
});
