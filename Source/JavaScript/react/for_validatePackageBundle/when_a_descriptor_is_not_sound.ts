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

describe('when an object descriptor describes its fields', () => {
    const object = (properties: ComponentDescriptor['properties']): ComponentDescriptor['properties'] =>
        [{ path: 'pager', label: 'Pager', group: 'Data', valueType: PropertyValueType.Object, properties }];

    it('should accept fields that are sound', () => {
        validatePackageBundle(bundleWith([text(object([{ path: 'size', label: 'Size', group: 'Data', valueType: PropertyValueType.Number }]))])).should.be.empty;
    });

    it('should report a field described twice', () => {
        const field = { path: 'size', label: 'Size', group: 'Data', valueType: PropertyValueType.Number };
        validatePackageBundle(bundleWith([text(object([field, field]))])).should.have.lengthOf(1);
    });

    it('should report an enum field without choices, however deeply it is nested', () => {
        const inner = { path: 'inner', label: 'Inner', group: 'Data', valueType: PropertyValueType.Object, properties: [{ path: 'kind', label: 'Kind', group: 'Data', valueType: PropertyValueType.Enum }] };
        validatePackageBundle(bundleWith([text(object([inner]))])).should.have.lengthOf(1);
    });

    it('should report a collection field without item descriptors', () => {
        validatePackageBundle(bundleWith([text(object([{ path: 'steps', label: 'Steps', group: 'Data', valueType: PropertyValueType.Collection }]))])).should.have.lengthOf(1);
    });
});

describe('when a descriptor describes component metadata', () => {
    const property = { path: 'items', label: 'Items', group: 'Content', valueType: PropertyValueType.Collection, item: { properties: [] } };

    it('should accept a component without a category, so a package written before categories still loads', () => {
        validatePackageBundle(bundleWith([text([])])).should.be.empty;
    });

    it('should accept a design mode over a collection property', () => {
        validatePackageBundle(bundleWith([{ ...text([property]), designMode: { itemsPath: 'items', addActions: [], itemToolbar: [] } }])).should.be.empty;
    });

    it('should report a design mode whose items are not a collection property', () => {
        validatePackageBundle(bundleWith([{ ...text([]), designMode: { itemsPath: 'items', addActions: [], itemToolbar: [] } }])).should.have.lengthOf(1);
    });

    it('should report a reference editor that does not say what it references', () => {
        validatePackageBundle(bundleWith([text([{ path: 'owner', label: 'Owner', group: 'Content', valueType: PropertyValueType.String, editorKind: 'reference' }])])).should.have.lengthOf(1);
    });
});
