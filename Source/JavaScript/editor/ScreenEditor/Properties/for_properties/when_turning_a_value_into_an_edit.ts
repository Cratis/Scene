// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditTarget, PropertyValueType, SceneEditKind, ValueSource, type InspectedProperty } from '@cratis/scene.model';
import { editForCollectionField, editForValue } from '../propertyEdits';

const property = (valueType: PropertyValueType, editTarget?: EditTarget): InspectedProperty => ({
    descriptor: { path: 'label', label: 'Label', group: 'Content', valueType },
    currentValue: undefined, effectiveValue: undefined, source: ValueSource.Default, editable: true, ...(editTarget ? { editTarget } : {}),
});

describe('when setting a property on the node', () => {
    const edit = editForValue('b1', property(PropertyValueType.String), 'Save');

    it('should set the property', () => edit.kind.should.equal(SceneEditKind.SetProperty));
    it('should address the node by its element id', () => (edit as { nodeId: string }).nodeId.should.equal('element:b1'));
});

describe('when setting a property Scene says belongs to this scope\'s instance', () => {
    const edit = editForValue('nav', property(PropertyValueType.String, EditTarget.Instance), 'Hello');

    it('should set an instance value', () => edit.kind.should.equal(SceneEditKind.SetInstanceValue));
    it('should name the component', () => (edit as { component: string }).component.should.equal('nav'));
});

describe('when a number is typed into the control', () => {
    it('should become a number', () => (editForValue('b', property(PropertyValueType.Number), '12') as { value: number }).value.should.equal(12));
    it('should reset the value when the field is cleared', () => editForValue('b', property(PropertyValueType.Number), '').kind.should.equal(SceneEditKind.ResetProperty));
});

describe('when clearing an instance value', () => {
    it('should reset the instance value', () => editForValue('b', property(PropertyValueType.Number, EditTarget.Instance), '').kind.should.equal(SceneEditKind.ResetInstanceValue));
});

describe('when editing a field of a collection item', () => {
    const edit = editForCollectionField('nav', property(PropertyValueType.Collection), 'i1', 'label', 'Orders') as { itemId: string; field: string; value: string };

    it('should name the item, the field and the value', () => [edit.itemId, edit.field, edit.value].should.deep.equal(['i1', 'label', 'Orders']));
});
