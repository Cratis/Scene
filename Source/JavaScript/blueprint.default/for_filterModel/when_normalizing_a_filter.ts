// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FilterFieldType, countActiveConditions, emptyFilter, maximumFilterDepth, newCondition, normalizeFilter, readFilterFields, updateGroupAt } from '../foundation';
import { moveColumn, readColumns, toggleColumn, visibleColumnIds } from '../foundation';

const fields = readFilterFields([{ name: 'owner' }, { name: 'status', label: 'Status', type: 'select', options: ['Open', 1, 'Won'] }, { name: 'value', type: 'number' }, { label: 'nameless' }, 'x']);

describe('when normalizing a filter', () => {
    it('should read the fields that have a name, defaulting the label and type', () => {
        fields.map(field => `${field.name}:${field.label}:${field.type}:${field.options.length}`).should.deep.equal(['owner:owner:text:0', 'status:Status:select:2', 'value:value:number:0']);
    });

    it('should drop a condition on a field that does not exist and repair an operator the type does not offer', () => {
        const filter = normalizeFilter({ operator: 'or', conditions: [{ field: 'gone', operator: 'is', value: 'x' }, { field: 'value', operator: 'contains', value: 5 }], groups: [] }, fields);
        filter.operator.should.equal('or');
        filter.conditions.should.deep.equal([{ field: 'value', operator: 'equals', value: '5' }]);
    });

    it('should return an empty filter for anything that is not one', () => {
        normalizeFilter('nope', fields).should.deep.equal(emptyFilter());
        normalizeFilter(undefined, fields).conditions.should.deep.equal([]);
    });

    it('should cut groups nested deeper than the maximum', () => {
        let nested: unknown = { operator: 'and', conditions: [], groups: [] };
        for (let level = 0; level < 6; level++) nested = { operator: 'and', conditions: [], groups: [nested] };
        let depth = 0;
        for (let group = normalizeFilter(nested, fields); group.groups.length > 0; group = group.groups[0]) depth++;
        depth.should.equal(maximumFilterDepth - 1);
    });

    it('should count only conditions that filter something', () => {
        const filter = normalizeFilter({
            operator: 'and', conditions: [{ field: 'owner', operator: 'contains', value: '  ' }, { field: 'owner', operator: 'isEmpty', value: '' }],
            groups: [{ operator: 'or', conditions: [{ field: 'owner', operator: 'equals', value: 'Ada' }], groups: [] }],
        }, fields);
        countActiveConditions(filter).should.equal(2);
    });

    it('should update the group at a path and leave the others as they were', () => {
        const root = { operator: 'and' as const, conditions: [], groups: [emptyFilter(), emptyFilter()] };
        const updated = updateGroupAt(root, [1], group => ({ ...group, operator: 'or' }));
        updated.groups.map(group => group.operator).should.deep.equal(['and', 'or']);
        updated.groups[0].should.equal(root.groups[0]);
    });

    it('should start a new condition on the first field with its default operator', () => {
        newCondition(fields).should.deep.equal({ field: 'owner', operator: 'contains', value: '' });
        newCondition([]).field.should.equal('');
        fields[1].type.should.equal(FilterFieldType.Select);
    });
});

describe('when choosing columns', () => {
    const columns = readColumns([{ id: 'name', locked: true, visible: false }, { id: 'owner', label: 'Owner' }, { id: 'status', visible: false }, { label: 'no id' }]);

    it('should show a locked column whatever it says and every other unless it says no', () => visibleColumnIds(columns).should.deep.equal(['name', 'owner']));

    it('should not hide a locked column', () => visibleColumnIds(toggleColumn(columns, 0)).should.deep.equal(['name', 'owner']));

    it('should show and hide a column', () => {
        visibleColumnIds(toggleColumn(columns, 2)).should.deep.equal(['name', 'owner', 'status']);
        visibleColumnIds(toggleColumn(columns, 1)).should.deep.equal(['name']);
    });

    it('should move a column and stay put at either end', () => {
        moveColumn(columns, 1, -1).map(column => column.id).should.deep.equal(['owner', 'name', 'status']);
        moveColumn(columns, 0, -1).should.equal(columns);
        moveColumn(columns, 2, 1).should.equal(columns);
    });
});
