// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { commandInputSources, componentOfSource, componentSourcePath } from '../commandInputSources';

const outputs = [
    { componentId: 'customer-field', label: 'Customer', outputs: [{ path: 'value', label: 'Value', type: 'String' }] },
    { componentId: 'orders-table', label: 'Orders table', outputs: [{ path: 'selectedItem', label: 'Selected item', type: 'Object' }] },
    { componentId: 'submit', label: 'Submit', outputs: [{ path: 'value', label: 'Value', type: 'String' }] },
];

describe('when listing the sources a command input can read', () => {
    const sources = commandInputSources(['row.id', 'route.orderId'], outputs, 'submit');

    it('should offer the data context first', () => sources.slice(0, 2).map(source => source.path).should.deep.equal(['row.id', 'route.orderId']));
    it('should offer what an input widget holds', () => sources.should.deep.include({ path: 'component.customer-field.value', label: 'Customer - Value' }));
    it('should offer what a table has selected', () => sources.should.deep.include({ path: 'component.orders-table.selectedItem', label: 'Orders table - Selected item' }));
    it('should not offer the component being configured', () => sources.some(source => source.path.startsWith('component.submit.')).should.be.false);
});

describe('when reading which component a source reads', () => {
    it('should name the component of a component source', () => componentOfSource(componentSourcePath('customer-field', 'value'))!.should.equal('customer-field'));
    it('should name none for a data context source', () => (componentOfSource('row.id') === undefined).should.be.true);
    it('should name none for a source without an output', () => (componentOfSource('component.lonely') === undefined).should.be.true);
});
