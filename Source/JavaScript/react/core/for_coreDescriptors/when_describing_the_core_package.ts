// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyValueType } from '@cratis/scene.model';
import { corePackage, coreDescriptors } from '../../index';

describe('when describing the core package', () => {
    it('should describe components', () => {
        coreDescriptors.length.should.be.greaterThan(0);
    });

    it('should ship the descriptors in its bundle', () => {
        (corePackage.descriptors === coreDescriptors).should.be.true;
    });

    it('should describe every layout-free component an author configures', () => {
        coreDescriptors.map(descriptor => descriptor.component).should.have.members(['core:button', 'core:action', 'core:column', 'core:navigationBar']);
    });

    it('should describe the navigation bar as an ordered collection of label, icon and destination', () => {
        const items = coreDescriptors.find(descriptor => descriptor.component === 'core:navigationBar')!.properties.find(property => property.path === 'items')!;
        items.valueType.should.equal(PropertyValueType.Collection);
        items.item!.properties.map(field => [field.path, field.valueType]).should.deep.equal([
            ['label', PropertyValueType.String], ['icon', PropertyValueType.Icon], ['destination', PropertyValueType.Destination],
        ]);
    });

    it('should describe an action\'s command and its argument mapping', () => {
        const action = coreDescriptors.find(descriptor => descriptor.component === 'core:action')!;
        action.properties.map(property => property.path).should.deep.equal(['label', 'command', 'arguments']);
        action.properties[2].valueType.should.equal(PropertyValueType.Collection);
    });
});
