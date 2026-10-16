// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, screen, within } from '@testing-library/react';
import { afterEach } from 'vitest';
import { renderFoundation, violationsIn } from './given';

const columns = [{ id: 'todo', label: 'To do' }, { id: 'doing', label: 'In progress', limit: 2 }, { id: 'done', label: 'Done' }];
const cards = [
    { id: '1', title: 'Fix checkout', column: 'doing', assignee: 'Amelia' },
    { id: '2', title: 'Write guide', column: 'todo', assignee: 'Oliver' },
    { id: '3', title: 'Review copy', column: 'doing', assignee: 'Amelia' },
    { id: '4', title: 'Triage inbox', column: 'todo' },
    { id: '5', title: 'Ship it', column: 'doing', assignee: 'Oliver' },
];
const lane = (name: string) => screen.getByRole('region', { name: new RegExp(`^${name}, \\d+ cards$`) });

// Part B 3.6: a task board's columns by status, optionally in a lane for each assignee.
describe('when laying out a board in swimlanes', () => {
    afterEach(cleanup);

    describe('and no swimlane is asked for', () => {
        it('should lay the cards out across the columns only', () => {
            const { container } = renderFoundation('kanbanBoard', { columns, cards, editPermission: 'enabled' });
            container.querySelectorAll('.foundation-board-lane').length.should.equal(0);
            container.querySelectorAll('.foundation-board').length.should.equal(1);
        });
    });

    describe('and the swimlane is by assignee', () => {
        let container: HTMLElement;
        beforeEach(() => { ({ container } = renderFoundation('kanbanBoard', { columns, cards, swimlane: 'assignee', editPermission: 'enabled' })); });

        it('should make a lane for each person in the order they appear, the unassigned last', () => {
            Array.from(container.querySelectorAll('.foundation-board-lane-title')).map(title => title.textContent).should.deep.equal(['Amelia2', 'Oliver2', 'Unassigned1']);
        });

        it('should put each card in the lane of its assignee, in the column of its status', () => {
            const amelia = lane('Amelia');
            within(amelia).getByRole('region', { name: 'Amelia, In progress, 2 cards' }).textContent!.should.contain('Fix checkout').and.contain('Review copy');
            within(lane('Oliver')).getByRole('region', { name: 'Oliver, To do, 1 cards' }).textContent!.should.contain('Write guide');
            within(lane('Unassigned')).getByRole('region', { name: 'Unassigned, To do, 1 cards' }).textContent!.should.contain('Triage inbox');
        });

        it('should call the columns of a lane by a lower heading than the lane, so the outline stays in order', () => {
            const headings = Array.from(lane('Amelia').querySelectorAll('h3, h4')).map(heading => heading.tagName);
            headings[0].should.equal('H3');
            headings.slice(1).every(tag => tag === 'H4').should.equal(true);
        });

        it('should move a card to another column within its lane, announcing it', () => {
            fireEvent.change(screen.getByLabelText('Move Write guide'), { target: { value: 'done' } });
            within(lane('Oliver')).getByRole('region', { name: 'Oliver, Done, 1 cards' }).textContent!.should.contain('Write guide');
            container.querySelector('[role="status"]')!.textContent!.should.contain('Write guide moved to Done');
        });

        it('should still say a column is over its limit, counting every lane', () => {
            container.querySelectorAll('.foundation-chip[data-tone="danger"]').length.should.be.greaterThan(0);
            container.textContent!.should.contain('Over the limit of 2');
        });

        it('should leave no accessibility violation', async () => (await violationsIn(container)).should.deep.equal([]));
    });
});
