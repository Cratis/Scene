// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { completed, doneTaskIds, isOverdue, readChecklist, toggleTask } from '../foundation';

const groups = readChecklist([
    { title: 'A', items: [{ id: '1', label: 'one', done: true, owner: 'Ada', due: '2026-03-01' }, { id: '2', label: 'two', due: '2026-03-10' }, { label: 'no id' }, 7] },
    { title: 7, items: [] },
    { title: 'B', items: [{ id: '3', label: 'three', due: 'not a date' }] },
    'x',
]);

describe('when tracking tasks', () => {
    it('should read groups with a title and tasks with an id and a label', () => {
        groups.map(group => `${group.title}:${group.items.map(item => item.id).join(',')}`).should.deep.equal(['A:1,2', 'B:3']);
    });

    it('should count the done tasks and list their ids', () => {
        completed(groups[0]).should.equal(1);
        doneTaskIds(groups).should.deep.equal(['1']);
    });

    it('should toggle one task and leave the rest', () => {
        const toggled = toggleTask(groups, '2');
        doneTaskIds(toggled).should.deep.equal(['1', '2']);
        doneTaskIds(toggleTask(toggled, '1')).should.deep.equal(['2']);
        toggled[1].should.equal(groups[1]);
    });

    it('should call an open task overdue only after its due day has ended', () => {
        const noon = new Date('2026-03-10T12:00:00Z');
        isOverdue(groups[0].items[1], noon).should.equal(false);
        isOverdue(groups[0].items[1], new Date('2026-03-11T00:00:01Z')).should.equal(true);
    });

    it('should not call a done task, a task without a due date or an unreadable date overdue', () => {
        const later = new Date('2030-01-01');
        isOverdue(groups[0].items[0], later).should.equal(false);
        isOverdue({ id: 'x', label: 'x', done: false }, later).should.equal(false);
        isOverdue(groups[1].items[0], later).should.equal(false);
    });
});
