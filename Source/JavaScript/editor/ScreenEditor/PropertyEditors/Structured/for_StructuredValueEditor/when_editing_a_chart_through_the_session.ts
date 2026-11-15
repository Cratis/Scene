// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyValueType } from '@cratis/scene.model';
import { undo } from '../../../Session/EditSession';
import { editableProperties } from '../../../Properties/toPropertyGroups';
import { createPropertyEditorRegistry } from '../../Registry/createPropertyEditorRegistry';
import { numberListEditorKind, stringListEditorKind, withIdentities } from '../structuredValue';
import { inspectProperty, openChart, setThroughTheSession } from './given/aChartInTheSession';

const data = { labels: ['Jan', 'Feb'], datasets: [{ id: 'sales', label: 'Sales', data: [1, 2], backgroundColor: '#336699', borderColor: '#003366' }] };

describe('when the chart is described by the real engine', () => {
    const session = openChart();
    const property = inspectProperty(session, 'data');

    it('should describe its data as an object, not as JSON', () => property.descriptor.valueType.should.equal(PropertyValueType.Object));
    it('should describe its labels as a list of words', () => property.descriptor.properties!.find(field => field.path === 'labels')!.editorKind!.should.equal(stringListEditorKind));
    it('should describe its datasets as a collection whose numbers are a list of numbers', () =>
        property.descriptor.properties!.find(field => field.path === 'datasets')!.item!.properties.find(field => field.path === 'data')!.editorKind!.should.equal(numberListEditorKind));
    it('should keep the label and group of the descriptor the package gave', () => [property.descriptor.label, property.descriptor.group].should.deep.equal(['Data', 'Data']));
});

describe('when data is set through the session', () => {
    const session = setThroughTheSession(openChart(), 'data', data);

    it('should be accepted, with the fields the descriptor does not describe kept', () => [session.diagnostics.length, JSON.stringify(inspectProperty(session, 'data').currentValue)].should.deep.equal([0, JSON.stringify(data)]));
    it('should be a single undo step', () => session.undoable.length.should.equal(1));
    it('should undo back to nothing set', () => (inspectProperty(undo(session), 'data').currentValue === undefined).should.be.true);
});

describe('when data saved without identifiers on its datasets is set through the session', () => {
    const saved = { labels: ['Jan'], datasets: [{ label: 'Sales', data: [1] }] };
    const accepted = setThroughTheSession(openChart(), 'data', saved);

    it('should be accepted as it is, because the datasets are told apart by position', () => accepted.diagnostics.length.should.equal(0));
    it('should be kept exactly', () => JSON.stringify(inspectProperty(accepted, 'data').currentValue).should.equal(JSON.stringify(saved)));
    it('should not be given identifiers by the identity step', () => JSON.stringify(withIdentities(inspectProperty(openChart(), 'data').descriptor, saved)).should.equal(JSON.stringify(saved)));
});

describe('when resolving the editors of the chart', () => {
    const registry = createPropertyEditorRegistry();
    const properties = ['data', 'options', 'style'].map(path => inspectProperty(openChart(), path));

    it('should edit the data, options and style through their fields', () => properties.map(property => registry.resolve(property.descriptor)?.id).should.deep.equal(['object', 'object', 'object']));
    it('should report an object nothing describes rather than editing it blind', () =>
        registry.resolve({ ...properties[1].descriptor, properties: undefined })?.id.should.equal('undescribed'));
    it('should leave a property a package draws to the package', () =>
        editableProperties(properties, 'c:chart', property => property.descriptor.path === 'data').map(property => property.descriptor.path).should.deep.equal(['options', 'style']));
    it('should leave a property the component publishes alone', () =>
        editableProperties([{ ...properties[1], descriptor: { ...properties[1].descriptor, output: true } }], 'c:chart').should.deep.equal([]));
});
