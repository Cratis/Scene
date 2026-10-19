// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { IndicatorButton, foundationElement } from '../foundation';

const show = (properties: Record<string, unknown>, onClick?: () => void) => render(
    <IndicatorButton element={foundationElement('indicatorButton', properties)} slots={{}} interactions={onClick ? { onClick } as never : undefined} />);

// The basket of a shop's topbar: a count that is a query result, drawn as a badge and said in words.
describe('when showing an indicator button', () => {
    afterEach(cleanup);

    describe('and the count is three', () => {
        beforeEach(() => show({ icon: 'cart', label: 'Basket', count: 3 }));

        it('should say the count in words', () => screen.getByRole('button').textContent!.should.contain('Basket: 3'));
        it('should draw the count in the badge', () => document.querySelector('.foundation-notifications-badge')!.textContent!.should.equal('3'));
    });

    describe('and the basket is empty', () => {
        beforeEach(() => show({ label: 'Basket', count: 0 }));

        it('should say it is empty', () => screen.getByRole('button').textContent!.should.contain('Basket: none'));
        it('should draw no badge', () => (document.querySelector('.foundation-notifications-badge') === null).should.be.true);
    });

    describe('and the count is above ninety-nine', () => {
        beforeEach(() => show({ label: 'Basket', count: 250 }));

        it('should cap the badge', () => document.querySelector('.foundation-notifications-badge')!.textContent!.should.equal('99+'));
    });

    describe('and it is pressed', () => {
        it('should run the behavior attached to it', () => {
            let pressed = 0;
            show({ label: 'Basket', count: 1 }, () => pressed++);
            fireEvent.click(screen.getByRole('button'));
            pressed.should.equal(1);
        });
    });
});
