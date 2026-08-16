// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { filterDefinitions } from '../filterDefinitions';

describe('when reading filter definitions', () => {
    describe('and a filter declares options', () => {
        const definitions = filterDefinitions({
            filters: [
                {
                    key: 'status',
                    label: 'Status',
                    type: 'string',
                    multi: true,
                    options: [
                        { key: 'draft', label: 'Draft', count: 12 },
                        { key: 'approved', label: 'Approved', value: 'Approved' },
                    ],
                },
            ],
        });

        it('should read the filter', () => definitions.should.have.lengthOf(1));
        it('should read the declared type', () => definitions[0].type!.should.equal('string'));
        it('should read the multi flag', () => definitions[0].multi!.should.equal(true));
        it('should fall back to the option key as its value', () => definitions[0].options![0].value!.should.equal('draft'));
        it('should use a declared option value when there is one', () => definitions[0].options![1].value!.should.equal('Approved'));
        it('should read the option count', () => definitions[0].options![0].count!.should.equal(12));
    });

    describe('and an entry is missing a key or a label', () => {
        const definitions = filterDefinitions({
            filters: [{ key: 'status', label: 'Status' }, { label: 'No key' }, { key: 'noLabel' }],
        });

        it('should keep only the filters that can be shown and applied', () =>
            definitions.map(definition => definition.key).should.deep.equal(['status']));
    });

    describe('and a filter declares a type outside the allowed set', () => {
        const definitions = filterDefinitions({ filters: [{ key: 'status', label: 'Status', type: 'colour' }] });

        it('should leave the type unset rather than passing an unknown one through', () => (definitions[0].type === undefined).should.be.true);
    });

    describe('and no filters property is set', () => {
        it('should read no filters', () => filterDefinitions({}).should.deep.equal([]));
    });
});
