// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentCategory, ComponentDescriptor, PropertyValueType, componentIcon } from '@cratis/scene.model';
import { componentMetadata, describeComponents } from '../describeComponents';

const described: ComponentDescriptor[] = [{
    component: 'Test:button', displayName: 'Push button', category: ComponentCategory.Input,
    properties: [{ path: 'label', label: 'Label', group: 'Content', valueType: PropertyValueType.String }],
}];

const metadata = {
    button: componentMetadata('Button', ComponentCategory.Actions, 'mouse-pointer-click', ['click'], 'Bt'),
    list: componentMetadata('List', ComponentCategory.DataDisplay, 'list', ['rows']),
};

describe('when merging component metadata into descriptors', () => {
    const result = describeComponents('Test', described, metadata);
    const byName = (name: string) => result.find(descriptor => descriptor.component === `Test:${name}`)!;

    it('should describe the hand-written component and the one only the metadata names', () => result.map(descriptor => descriptor.component).should.deep.equal(['Test:button', 'Test:list']));

    it('should keep what the hand-written descriptor says', () => {
        byName('button').displayName!.should.equal('Push button');
        byName('button').category!.should.equal(ComponentCategory.Input);
        byName('button').properties.should.have.lengthOf(1);
    });

    it('should fill in what the hand-written descriptor leaves out', () => {
        byName('button').icon!.should.deep.equal(componentIcon('mouse-pointer-click'));
        byName('button').keywords!.should.deep.equal(['click']);
        byName('button').badge!.should.equal('Bt');
    });

    it('should describe a component only the metadata names, with no editable properties', () => {
        byName('list').properties.should.be.empty;
        byName('list').category!.should.equal(ComponentCategory.DataDisplay);
        byName('list').displayName!.should.equal('List');
    });

    it('should leave a descriptor without metadata as it is', () => {
        const alone: ComponentDescriptor = { component: 'Test:other', properties: [] };
        describeComponents('Test', [alone], {})[0].should.equal(alone);
    });
});
