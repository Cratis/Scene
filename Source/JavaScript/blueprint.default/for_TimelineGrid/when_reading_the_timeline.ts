// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TimelineScale, isConflicting, lanesOf, offsetOf, placeOf, predecessorsOf, readTimelineItems, spanOf, successorsOf, ticksOf } from '../foundation';

const items = readTimelineItems([
    { id: 'a', title: 'Design', start: '2026-03-02', end: '2026-03-13', lane: 'Ada', progress: 140 },
    { id: 'b', title: 'Build', start: '2026-03-12', end: '2026-03-27', lane: 'Grace', dependsOn: ['a', 'missing', 'b'] },
    { id: 'c', title: 'Launch', start: '2026-03-30', milestone: true, lane: 'Ada', dependsOn: ['b'] },
    { id: 'a', title: 'Repeated', start: '2026-03-02' },
    { id: 'd', start: '2026-03-02' },
]);

// The timeline works in calendar days like the calendar, and says in the model what the picture shows: the dependencies, the conflicts, the place of a bar.
describe('when reading the items of a timeline', () => {
    it('should drop what cannot be placed and keep the rest in order', () => items.map(item => item.id).should.deep.equal(['a', 'b', 'c']));

    it('should keep progress between nothing and all', () => items.map(item => item.progress).should.deep.equal([100, 0, 0]));

    it('should drop a dependency on an unknown item or on itself', () => items.map(item => item.dependsOn).should.deep.equal([[], ['a'], ['b']]));

    it('should find what an item waits on and what waits on it', () => {
        predecessorsOf(items, items[1]).map(item => item.id).should.deep.equal(['a']);
        successorsOf(items, items[1]).map(item => item.id).should.deep.equal(['c']);
    });

    it('should call an item that starts before its predecessor has finished a conflict', () => items.map(item => isConflicting(items, item)).should.deep.equal([false, true, false]));

    it('should group the items in lanes in the order the lanes first appear', () => lanesOf(items).map(lane => [lane.lane, lane.items.map(item => item.id)]).should.deep.equal([['Ada', ['a', 'c']], ['Grace', ['b']]]));

    it('should widen the span to whole ticks of the scale', () => {
        spanOf(items, TimelineScale.Day, 1)!.should.deep.equal({ from: '2026-03-02', to: '2026-03-30' });
        spanOf(items, TimelineScale.Week, 1)!.should.deep.equal({ from: '2026-03-02', to: '2026-04-05' });
        spanOf(items, TimelineScale.Month, 1)!.should.deep.equal({ from: '2026-03-01', to: '2026-03-31' });
        (spanOf([], TimelineScale.Week, 1) === undefined).should.equal(true);
    });

    it('should put a tick on every week and every month', () => {
        ticksOf({ from: '2026-03-02', to: '2026-04-05' }, TimelineScale.Week, 1).map(tick => tick.day).should.deep.equal(['2026-03-02', '2026-03-09', '2026-03-16', '2026-03-23', '2026-03-30']);
        ticksOf({ from: '2026-03-01', to: '2026-05-31' }, TimelineScale.Month, 1).map(tick => tick.day).should.deep.equal(['2026-03-01', '2026-04-01', '2026-05-01']);
    });

    it('should place a bar from the start of its first day to the end of its last', () => {
        const place = placeOf(items[0], { from: '2026-03-02', to: '2026-03-15' });
        [place.offset, place.width].should.deep.equal([0, (12 / 14) * 100]);
    });

    it('should place a day on the axis only when it is within it', () => {
        offsetOf('2026-03-10', { from: '2026-03-09', to: '2026-03-15' })!.should.be.closeTo(((1 + 0.5) / 7) * 100, 0.0001);
        (offsetOf('2026-03-20', { from: '2026-03-09', to: '2026-03-15' }) === undefined).should.equal(true);
    });
});
