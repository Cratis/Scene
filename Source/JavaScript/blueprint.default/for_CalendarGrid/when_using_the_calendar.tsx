// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, screen, within } from '@testing-library/react';
import { afterEach } from 'vitest';
import { renderFoundation, violationsIn } from '../for_foundation/given';

const events = [
    { id: 'e1', title: 'Ada Lovelace', start: '2026-03-09', end: '2026-03-13', category: 'Annual leave', tone: 'success', person: 'Ada Lovelace' },
    { id: 'e2', title: 'Grace Hopper', start: '2026-03-10', category: 'Sick leave', tone: 'warning' },
    { id: 'e3', title: 'Linus Torvalds', start: '2026-03-10', category: 'Training', tone: 'info' },
    { id: 'e4', title: 'Margaret Hamilton', start: '2026-03-10', category: 'Training', tone: 'neutral' },
];
const calendar = (properties: Record<string, unknown> = {}) => renderFoundation('calendarGrid', { events, today: '2026-03-10', date: '2026-03-10', locale: 'en-GB', ...properties });

// Spec Part B 2.12: the calendar - month, week and agenda, keyboard usable, with the busy day told in full.
describe('when using the calendar', () => {
    afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

    it('should name the month and mark today', () => {
        const { container } = calendar();
        screen.getByRole('heading', { name: 'March 2026' });
        container.querySelector('[aria-current="date"]')!.getAttribute('data-day')!.should.equal('2026-03-10');
    });

    it('should draw a table of whole weeks starting on the first day of the week', () => {
        const { container } = calendar();
        const headers = Array.from(container.querySelectorAll('th')).map(header => header.textContent);
        headers.should.deep.equal(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
        container.querySelectorAll('tbody tr').length.should.equal(6);
    });

    it('should start the week on Sunday when asked to', () => {
        const { container } = calendar({ firstDay: 0 });
        Array.from(container.querySelectorAll('th'))[0].textContent!.should.equal('Sun');
    });

    it('should show at most two events in a day and say how many more there are', () => {
        const { container } = calendar();
        const cell = container.querySelector('[data-day="2026-03-10"]')!.closest('td')!;
        within(cell).getAllByRole('button').filter(button => button.classList.contains('foundation-calendar-event')).length.should.equal(2);
        within(cell).getByRole('button', { name: '2 more' });
    });

    it('should list every event of the selected day below the table, with its category in words', () => {
        calendar();
        const panel = screen.getByRole('region', { name: /Events on/ });
        ['Ada Lovelace', 'Grace Hopper', 'Linus Torvalds', 'Margaret Hamilton'].forEach(name => within(panel).getAllByText(name).length.should.be.greaterThan(0));
        within(panel).getAllByText('Sick leave').length.should.be.greaterThan(0);
    });

    it('should move the selected day with the arrow keys and keep it in the address', () => {
        const { container } = calendar({ urlKey: 'date' });
        const day = container.querySelector<HTMLElement>('[data-day="2026-03-10"]')!;
        day.focus();
        fireEvent.keyDown(day, { key: 'ArrowRight' });
        window.location.search.should.contain('date=2026-03-11');
        container.querySelector('[data-day="2026-03-11"]')!.getAttribute('aria-pressed')!.should.equal('true');
        document.activeElement!.getAttribute('data-day')!.should.equal('2026-03-11');
    });

    it('should step to the next month and back to today', () => {
        calendar();
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        screen.getByRole('heading', { name: 'April 2026' });
        fireEvent.click(screen.getByRole('button', { name: 'Today' }));
        screen.getByRole('heading', { name: 'March 2026' });
    });

    it('should show one week with every event when the view is the week', () => {
        const { container } = calendar({ view: 'week' });
        screen.getByRole('heading', { name: /9 Mar – 15 Mar 2026/ });
        container.querySelectorAll('tbody tr').length.should.equal(1);
        (within(container.querySelector('[data-day="2026-03-10"]')!.closest('td')!).queryByRole('button', { name: /more/ }) === null).should.equal(true);
    });

    it('should list the month day by day as an agenda', () => {
        const { container } = calendar({ view: 'agenda' });
        (container.querySelector('table') === null).should.equal(true);
        screen.getAllByRole('heading', { level: 4 }).length.should.be.greaterThan(2);
    });

    it('should select an event and press its button', () => {
        calendar();
        const button = screen.getAllByRole('button', { name: /Ada Lovelace.*Annual leave/ })[0];
        fireEvent.click(button);
        button.getAttribute('aria-pressed')!.should.equal('true');
    });

    it('should leave the month, the week and the agenda without an accessibility violation', async () => {
        for (const view of ['month', 'week', 'agenda']) {
            const { container } = calendar({ view });
            (await violationsIn(container)).should.deep.equal([]);
            cleanup();
        }
    });
});
