// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ActivityKind, dayOf, groupByDay, initialsOf, readActivity, readPeople, visiblePeople } from '../foundation';

const entries = readActivity([
    { id: 'a', actor: 'Ada', action: 'commented', kind: 'comment', at: '2026-03-10T09:00:00Z', body: 'Hi' },
    { id: 'b', actor: 'Grace', action: 'edited', kind: 'banana', at: '2026-03-09T23:30:00Z' },
    { id: 'c', at: '2026-03-10T10:00:00Z' },
    { id: 'd', at: 'never' },
    { actor: 'no id', at: '2026-03-10T10:00:00Z' },
]);

describe('when grouping activity', () => {
    it('should keep the entries with an id and a time that parses, and treat an unknown kind as system', () => {
        entries.map(entry => `${entry.id}:${entry.kind}`).should.deep.equal(['a:comment', 'b:system', 'c:system']);
    });

    it('should cut days in the given time zone', () => {
        dayOf('2026-03-09T23:30:00Z', 'UTC').should.equal('2026-03-09');
        dayOf('2026-03-09T23:30:00Z', 'Asia/Tokyo').should.equal('2026-03-10');
    });

    it('should group newest first by default, and oldest first when ascending', () => {
        groupByDay(entries, false, 'UTC').map(day => `${day.day}:${day.entries.map(entry => entry.id).join('')}`).should.deep.equal(['2026-03-10:ca', '2026-03-09:b']);
        groupByDay(entries, true, 'UTC').map(day => `${day.day}:${day.entries.map(entry => entry.id).join('')}`).should.deep.equal(['2026-03-09:b', '2026-03-10:ac']);
    });

    it('should regroup the same entries differently in another zone', () => {
        groupByDay(entries, true, 'Asia/Tokyo').map(day => day.day).should.deep.equal(['2026-03-10']);
    });

    it('should keep a comment kind and body', () => {
        entries[0].kind.should.equal(ActivityKind.Comment);
        entries[0].body!.should.equal('Hi');
    });
});

describe('when showing people as avatars', () => {
    it('should take the first letters of the first and last words', () => {
        initialsOf('Ada King Lovelace').should.equal('AL');
        initialsOf('ada').should.equal('A');
        initialsOf('  ').should.equal('');
        initialsOf('élodie dupont').should.equal('ÉD');
    });

    it('should read named people only', () => readPeople([{ name: ' Ada ' }, { name: '' }, { imageUrl: 'x' }, { name: 'Bo', imageUrl: 'b.png' }, 3]).should.deep.equal([{ name: 'Ada' }, { name: 'Bo', imageUrl: 'b.png' }]));

    it('should fold the people beyond the maximum into a count, and always show at least one', () => {
        const people = readPeople([{ name: 'a' }, { name: 'b' }, { name: 'c' }]);
        visiblePeople(people, 5).should.deep.equal({ shown: people, hidden: 0 });
        visiblePeople(people, 2).hidden.should.equal(1);
        visiblePeople(people, 0).shown.length.should.equal(1);
    });
});
