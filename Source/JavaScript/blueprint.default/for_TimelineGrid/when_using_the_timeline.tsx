// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, screen, within } from '@testing-library/react';
import { afterEach } from 'vitest';
import { renderFoundation, violationsIn } from '../for_foundation/given';

const items = [
    { id: 't1', title: 'Design', start: '2026-03-02', end: '2026-03-13', lane: 'Ada Lovelace', progress: 100, tone: 'success' },
    { id: 't2', title: 'Build', start: '2026-03-12', end: '2026-04-10', lane: 'Grace Hopper', progress: 20, tone: 'info', dependsOn: ['t1'] },
    { id: 't3', title: 'Launch', start: '2026-04-20', milestone: true, lane: 'Grace Hopper', dependsOn: ['t2'] },
];
const timeline = (properties: Record<string, unknown> = {}) => renderFoundation('timelineGrid', { items, today: '2026-03-10', locale: 'en-GB', ...properties });

// Spec Part B 2.12: the timeline - a Gantt-style schedule whose every fact is also said in words and in a table.
describe('when using the timeline', () => {
    afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

    it('should draw a lane for each person with a bar for each item', () => {
        const { container } = timeline();
        screen.getByRole('group', { name: 'Ada Lovelace' });
        container.querySelectorAll('.foundation-timeline-bar').length.should.equal(3);
        (container.querySelector('.foundation-timeline-today') === null).should.equal(false);
    });

    it('should name a bar by its title, lane, dates and progress', () => {
        timeline();
        screen.getByRole('button', { name: /^Design, Ada Lovelace, .*2 March 2026.*13 March 2026, 100% done/ });
    });

    it('should draw a milestone as a marker rather than a bar and mark a conflicting item in words', () => {
        const { container } = timeline();
        container.querySelector('[data-milestone="true"]')!.textContent!.should.contain('Launch');
        screen.getByRole('button', { name: /Build.*Starts before something it waits on has finished/ });
    });

    it('should say what the selected item waits on and what waits on it', () => {
        timeline();
        fireEvent.click(screen.getByRole('button', { name: /^Build,/ }));
        const panel = screen.getByRole('region', { name: 'Selected item' });
        within(panel).getByText('Waits on: Design');
        within(panel).getByText('Holds up: Launch');
        within(panel).getByText('Starts before something it waits on has finished');
    });

    it('should change the scale and keep it in the address', () => {
        const { container } = timeline({ urlKey: 'scale' });
        fireEvent.click(screen.getByRole('button', { name: 'Months' }));
        window.location.search.should.contain('scale=month');
        container.querySelector('[data-scale]')!.getAttribute('data-scale')!.should.equal('month');
    });

    it('should offer the same schedule as a table', () => {
        const { container } = timeline();
        const rows = container.querySelectorAll('.foundation-timeline-table tbody tr');
        rows.length.should.equal(3);
        rows[1].textContent!.should.contain('Design');
    });

    it('should leave the timeline without an accessibility violation', async () => {
        const { container } = timeline();
        (await violationsIn(container)).should.deep.equal([]);
    });
});
