// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor, PackageKind, PropertyValueType } from '@cratis/scene.model';
import { componentRegistryKey, ScenePackageBundle, validatePackageBundle } from '../index';
import { CoreText } from '../core';

function bundleWith(descriptors: ComponentDescriptor[]): ScenePackageBundle {
    return {
        manifest: {
            name: 'Test', version: '1.0.0', kind: PackageKind.ComponentLibrary, dependencies: [], components: ['text'],
            layouts: [], screenTemplates: [], dialogTemplates: [], themes: [],
        },
        components: { [componentRegistryKey('Test', 'text')]: CoreText },
        descriptors,
    };
}

const text = (properties: ComponentDescriptor['properties']): ComponentDescriptor => ({ component: 'Test:text', properties });

describe('when a descriptor is not sound', () => {
    it('should accept a descriptor for a declared component', () => {
        validatePackageBundle(bundleWith([text([{ path: 'text', label: 'Text', group: 'Content', valueType: PropertyValueType.String }])])).should.be.empty;
    });

    it('should report a descriptor for a component the manifest does not declare', () => {
        validatePackageBundle(bundleWith([{ component: 'Test:ghost', properties: [] }])).should.have.lengthOf(1);
    });

    it('should report a component described twice', () => {
        validatePackageBundle(bundleWith([text([]), text([])])).should.have.lengthOf(1);
    });

    it('should report a property described twice', () => {
        const property = { path: 'text', label: 'Text', group: 'Content', valueType: PropertyValueType.String };
        validatePackageBundle(bundleWith([text([property, property])])).should.have.lengthOf(1);
    });

    it('should report a collection without item descriptors', () => {
        validatePackageBundle(bundleWith([text([{ path: 'items', label: 'Items', group: 'Content', valueType: PropertyValueType.Collection }])])).should.have.lengthOf(1);
    });

    it('should report an enum without choices', () => {
        validatePackageBundle(bundleWith([text([{ path: 'size', label: 'Size', group: 'Look', valueType: PropertyValueType.Enum }])])).should.have.lengthOf(1);
    });
});
