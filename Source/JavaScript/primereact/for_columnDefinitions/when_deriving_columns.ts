// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent, HorizontalAlignment, VerticalAlignment, Visibility } from '@cratis/scene.model';
import { columnDefinitions } from '../data';

function table(properties: Record<string, unknown>, slots: ExternalComponent['slots'] = {}): ExternalComponent {
    return {
        id: 'table',
        name: 'table',
        properties,
        slots,
        componentName: 'PrimeReact:table',
        visibility: Visibility.Visible,
        isEnabled: true,
        opacity: 1,
        size: {},
        zIndex: 0,
        minimumSize: {},
        maximumSize: {},
        margin: { left: 0, top: 0, right: 0, bottom: 0 },
        horizontalAlignment: HorizontalAlignment.Stretch,
        verticalAlignment: VerticalAlignment.Stretch,
    };
}

const rows = [{ name: 'Ada', role: 'Engineer' }];

describe('when deriving columns', () => {
    describe('and the table has nested column children', () => {
        const element = table({ columns: ['ignored'] }, { columns: [{ id: 'c1', properties: { field: 'name', header: 'Name', sortable: true } }] });

        it('should use them in preference to anything else, because they are the most explicit statement', () => {
            columnDefinitions(element, rows).should.deep.equal([{ field: 'name', header: 'Name', sortable: true }]);
        });
    });

    describe('and a nested column child gives no header', () => {
        const element = table({}, { columns: [{ id: 'c1', properties: { field: 'name' } }] });

        it('should label it with the field rather than leaving it blank', () => {
            columnDefinitions(element, rows).should.deep.equal([{ field: 'name', header: 'name', sortable: false }]);
        });
    });

    describe('and the table configures its columns as records', () => {
        const element = table({ columns: [{ field: 'role', header: 'Role' }] });

        it('should use them', () => {
            columnDefinitions(element, rows).should.deep.equal([{ field: 'role', header: 'Role', sortable: false }]);
        });
    });

    describe('and the table configures its columns as bare field names', () => {
        const element = table({ columns: ['role'] });

        it('should use each name as both field and header', () => {
            columnDefinitions(element, rows).should.deep.equal([{ field: 'role', header: 'role', sortable: false }]);
        });
    });

    describe('and the table configures no columns at all', () => {
        const element = table({});

        it('should infer them from the first row, so a table with data renders it', () => {
            columnDefinitions(element, rows).should.deep.equal([
                { field: 'name', header: 'name', sortable: false },
                { field: 'role', header: 'role', sortable: false },
            ]);
        });
    });

    describe('and the table has neither columns nor rows', () => {
        const element = table({});

        it('should derive no columns rather than throwing', () => {
            columnDefinitions(element, []).should.deep.equal([]);
        });
    });
});
