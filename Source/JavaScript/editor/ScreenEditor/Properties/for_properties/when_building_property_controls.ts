// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyValueType, ValueSource, EditTarget, type InspectedProperty } from '@cratis/scene.model';
import { editableProperties, groupProperties, isDrawnByItsOwnEditor } from '../toPropertyGroups';

const property = (path: string, valueType: PropertyValueType, extra: Partial<InspectedProperty['descriptor']> = {}, rest: Partial<InspectedProperty> = {}): InspectedProperty => ({
    descriptor: { path, label: path, group: 'Content', valueType, ...extra },
    currentValue: undefined, effectiveValue: 'v', source: ValueSource.Default, editable: true, ...rest,
});

describe('when grouping properties', () => {
    const result = groupProperties([
        property('label', PropertyValueType.String, { group: 'Content' }),
        property('gap', PropertyValueType.Number, { group: 'Layout' }),
        property('title', PropertyValueType.String, { group: 'Content' }),
        property('q', PropertyValueType.QueryReference, { group: 'Data' }),
    ]);

    it('should keep a group per descriptor group, in order of first appearance', () => result.map(group => group.name).should.deep.equal(['Content', 'Layout', 'Data']));
    it('should put each property in its group, in the order given', () => result[0].properties.map(candidate => candidate.descriptor.path).should.deep.equal(['label', 'title']));
});

describe('when a property is set on an instance', () => {
    it('should report the instance as the edit target', () => (property('p', PropertyValueType.String, {}, { editTarget: EditTarget.Instance }).editTarget!).should.equal('instance'));
});

describe('when a component has properties a dedicated editor draws', () => {
    const properties = [property('label', PropertyValueType.String), property('command', PropertyValueType.String), property('presentation', PropertyValueType.Enum)];

    it('should leave out the action editor\'s properties', () =>
        editableProperties(properties, 'core:action').map(candidate => candidate.descriptor.path).should.deep.equal(['label']));
    it('should recognise them whether the type is qualified or bare', () => isDrawnByItsOwnEditor('action', 'command').should.be.true);
    it('should draw everything for other components', () => editableProperties(properties, 'core:button').length.should.equal(3));
    it('should draw everything when the type is not known', () => editableProperties(properties, '').length.should.equal(3));
});

describe('when a component publishes a structured value', () => {
    const selected = property('selectedItem', PropertyValueType.Object, { output: true });

    it('should leave the output out, because nothing is authored there', () => editableProperties([selected, property('label', PropertyValueType.String)], 'c:table').map(candidate => candidate.descriptor.path).should.deep.equal(['label']));
    it('should keep a published single value, which is shown read-only', () => editableProperties([property('value', PropertyValueType.String, { output: true })], 'c:input').length.should.equal(1));
});

describe('when a package draws a property itself', () => {
    it('should leave it to the package', () =>
        editableProperties([property('a', PropertyValueType.String), property('b', PropertyValueType.String)], 'c:x', candidate => candidate.descriptor.path === 'b').map(candidate => candidate.descriptor.path).should.deep.equal(['a']));
});
