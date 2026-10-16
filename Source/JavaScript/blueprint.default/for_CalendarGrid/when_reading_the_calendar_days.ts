// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CalendarView, addDays, addMonths, daysWithEvents, eventsOn, monthGrid, moveFocus, rangeOf, readCalendarEvents, readDay, startOfWeek, step, weekOf } from '../foundation';

// The calendar works on calendar days, never on instants: no time zone can move an event to the neighbouring day.
describe('when reading the days of a calendar', () => {
    it('should read a day only when it is a real calendar day', () =>
        [readDay('2026-03-10'), readDay('2026-03-10T23:30:00+05:00'), readDay('2026-02-30'), readDay('soon'), readDay(5)].should.deep.equal(['2026-03-10', '2026-03-10', undefined, undefined, undefined]));

    it('should add days across month and year ends', () =>
        [addDays('2026-01-31', 1), addDays('2026-01-01', -1), addDays('2028-02-28', 1)].should.deep.equal(['2026-02-01', '2025-12-31', '2028-02-29']));

    it('should keep a month step in the target month', () =>
        [addMonths('2026-01-31', 1), addMonths('2026-03-31', -1), addMonths('2026-12-15', 1)].should.deep.equal(['2026-02-28', '2026-02-28', '2027-01-15']));

    it('should begin the week on the first day of the week', () => {
        startOfWeek('2026-03-10', 1).should.equal('2026-03-09');
        startOfWeek('2026-03-10', 0).should.equal('2026-03-08');
        weekOf('2026-03-10', 1).should.deep.equal(['2026-03-09', '2026-03-10', '2026-03-11', '2026-03-12', '2026-03-13', '2026-03-14', '2026-03-15']);
    });

    it('should lay a month out in whole weeks', () => {
        const weeks = monthGrid('2026-03-10', 1);
        [weeks.length, weeks[0][0], weeks[weeks.length - 1][6], weeks.every(week => week.length === 7)].should.deep.equal([6, '2026-02-23', '2026-04-05', true]);
    });

    it('should step a month or a week and give the range a view shows', () => {
        [step('2026-03-10', CalendarView.Month, 1), step('2026-03-10', CalendarView.Week, -1)].should.deep.equal(['2026-04-10', '2026-03-03']);
        rangeOf('2026-03-10', CalendarView.Week, 1).should.deep.equal({ from: '2026-03-09', to: '2026-03-15' });
        rangeOf('2026-03-10', CalendarView.Agenda, 1).should.deep.equal({ from: '2026-03-01', to: '2026-03-31' });
    });

    it('should move the focus with the arrow and page keys', () =>
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageDown', 'Enter'].map(key => moveFocus('2026-03-10', key))
            .should.deep.equal(['2026-03-09', '2026-03-11', '2026-03-03', '2026-03-17', '2026-04-10', undefined]));

    const events = readCalendarEvents([
        { id: 'b', title: 'Later', start: '2026-03-12', end: '2026-03-14' },
        { id: 'a', title: 'First', start: '2026-03-10', end: '2026-03-09' },
        { id: 'a', title: 'Repeated', start: '2026-03-10' },
        { id: 'c', start: '2026-03-10' },
        { id: 'd', title: 'No day', start: 'x' },
    ]);

    it('should drop events that cannot be placed, repeated ids included, and sort the rest', () => events.map(event => event.id).should.deep.equal(['a', 'b']));

    it('should take an end before the start as a one-day event', () => [events[0].start, events[0].end].should.deep.equal(['2026-03-10', '2026-03-10']));

    it('should find the events of a day, spanning events included', () => {
        eventsOn(events, '2026-03-13').map(event => event.id).should.deep.equal(['b']);
        eventsOn(events, '2026-03-11').should.deep.equal([]);
    });

    it('should list the days with events within a range', () => daysWithEvents(events, '2026-03-11', '2026-03-13').should.deep.equal(['2026-03-12', '2026-03-13']));
});
