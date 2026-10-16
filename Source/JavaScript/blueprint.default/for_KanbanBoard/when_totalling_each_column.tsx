// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { BoardCard, readCards, totalOf } from '../foundation';
import { renderFoundation, violationsIn } from '../for_foundation/given';

const columns = [{ id: 'new', label: 'New' }, { id: 'won', label: 'Won' }];
const cards = [
    { id: 'c1', title: 'Acme renewal', column: 'new', amount: 12000 },
    { id: 'c2', title: 'Globex rollout', column: 'new', amount: 8400.5 },
    { id: 'c3', title: 'Initech pilot', column: 'won', amount: 500 },
    { id: 'c4', title: 'Umbrella upgrade', column: 'won' },
];

const totals = (container: HTMLElement) => Array.from(container.querySelectorAll('.foundation-board-total')).map(total => total.getAttribute('data-total'));
const shown = (container: HTMLElement) => Array.from(container.querySelectorAll('.foundation-board-total')).map(total => total.textContent!.replace(/\u00a0/g, ' '));

// The board's columns show what each holds (spec Part B 2.5 and the CRM pipeline header): the total of a numeric card field, formatted for the locale.
describe('when totalling each column of a kanban board', () => {
    afterEach(cleanup);

    it('should keep the numeric fields of a card and sum them', () => {
        const read: BoardCard[] = readCards(cards);
        [totalOf(read.filter(card => card.column === 'new'), 'amount'), totalOf(read.filter(card => card.column === 'won'), 'amount'), totalOf(read, 'missing')].should.deep.equal([20400.5, 500, 0]);
    });

    it('should show no total unless a total field is named', () => {
        const { container } = renderFoundation('kanbanBoard', { columns, cards });
        container.querySelectorAll('.foundation-board-total').length.should.equal(0);
    });

    it('should show each column header with its total as a currency in the locale', () => {
        const { container } = renderFoundation('kanbanBoard', { columns, cards, totalField: 'amount', format: 'currency', currency: 'NOK', locale: 'nb-NO' });
        shown(container).should.deep.equal(['20 401 kr', '500 kr']);
        totals(container).should.deep.equal(['20400.5', '500']);
    });

    it('should move the total with the card when the card is moved', () => {
        const { container } = renderFoundation('kanbanBoard', { columns, cards, totalField: 'amount', editPermission: 'enabled', locale: 'en-GB' });
        fireEvent.change(screen.getByLabelText('Move Acme renewal'), { target: { value: 'won' } });
        totals(container).should.deep.equal(['8400.5', '12500']);
    });

    it('should leave a board with totals without an accessibility violation', async () => {
        const { container } = renderFoundation('kanbanBoard', { columns, cards, totalField: 'amount', format: 'currency', currency: 'USD', locale: 'en-US' });
        (await violationsIn(container)).should.deep.equal([]);
    });
});
