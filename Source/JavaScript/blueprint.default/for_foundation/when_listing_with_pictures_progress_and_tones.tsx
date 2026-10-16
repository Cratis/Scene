// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { renderFoundation, violationsIn } from './given';

const columns = [
    { field: 'name', header: 'Name' },
    { field: 'done', header: 'Progress', kind: 'progress' },
    { field: 'status', header: 'Status', kind: 'status', tones: { 'Low stock': 'warning', 'In stock': 'success' } },
];
const rows = [
    { id: 'a', name: 'Pallet jack', done: 40, status: 'Low stock', tone: 'warning', photo: 'https://example.com/jack.png' },
    { id: 'b', name: 'Forklift', done: 100, status: 'In stock', tone: '', photo: '' },
];

// Spec Part B 3.4-3.6: a list of cards with a picture, a progress bar in a cell, and a row emphasis that never stands alone.
describe('when listing with pictures, progress and tones', () => {
    afterEach(cleanup);

    describe('and the list is cards with an image field', () => {
        let container: HTMLElement;
        beforeEach(() => { ({ container } = renderFoundation('dataList', { label: 'Items', rows, columns, variant: 'cards', titleField: 'name', imageField: 'photo', toneField: 'tone' })); });

        it('should show the picture of a row that has one, as decoration its title already names', () => {
            const picture = container.querySelectorAll('.foundation-card-picture')[0];
            picture.getAttribute('aria-hidden')!.should.equal('true');
            picture.querySelector('img')!.getAttribute('src')!.should.equal('https://example.com/jack.png');
        });

        it('should show the initials of a row without a picture', () => {
            container.querySelectorAll('.foundation-card-picture')[1].textContent!.should.equal('F');
        });

        it('should mark a row with its tone, beside the status that says the same in words', () => {
            const cards = container.querySelectorAll('.foundation-card-row');
            cards[0].getAttribute('data-tone')!.should.equal('warning');
            cards[0].textContent!.should.contain('Low stock');
        });
    });

    describe('and the list is a table with a progress column', () => {
        let container: HTMLElement;
        beforeEach(() => { ({ container } = renderFoundation('dataList', { label: 'Items', rows, columns, titleField: 'name', toneField: 'tone', locale: 'en-GB' })); });

        it('should draw the percentage as a progress bar named by its column, with the figure in words', () => {
            const bar = container.querySelector('progress')!;
            [bar.getAttribute('value'), bar.getAttribute('max'), bar.getAttribute('aria-label')].should.deep.equal(['40', '100', 'Progress']);
            container.querySelector('.foundation-progress')!.textContent!.should.contain('40%');
        });

        it('should tint the row of its tone', () => container.querySelector('tbody tr')!.getAttribute('data-tone')!.should.equal('warning'));

        it('should leave no accessibility violation', async () => (await violationsIn(container)).should.deep.equal([]));
    });
});
