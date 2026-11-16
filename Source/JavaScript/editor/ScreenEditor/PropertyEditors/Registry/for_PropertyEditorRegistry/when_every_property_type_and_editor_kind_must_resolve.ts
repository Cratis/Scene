// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyEditorKind, PropertyValueType, type ComponentDescriptor, type PropertyDescriptor } from '@cratis/scene.model';
import { componentsBlueprint } from '@cratis/scene.blueprint.components';
import { defaultBlueprint } from '@cratis/scene.blueprint.default';
import { cratisComponentsPackage } from '@cratis/scene.components';
import { primeReactPackage } from '@cratis/scene.primereact';
import { corePackage } from '@cratis/scene.react';
import { tailwindPackage } from '@cratis/scene.tailwind';
import { studioEditorKinds } from '../../../Runtime/studioEditorKinds';
import { createPropertyEditorRegistry } from '../createPropertyEditorRegistry';

// PE1: every property type has a default editor and every editor kind the packages' descriptors name resolves to one. A new value type, or a
// descriptor that names an editor nobody registered, fails here rather than appearing in the sidebar as a property that cannot be edited.
const registry = createPropertyEditorRegistry();
const descriptors: ComponentDescriptor[] = [corePackage, cratisComponentsPackage, primeReactPackage, tailwindPackage, defaultBlueprint, componentsBlueprint].flatMap(bundle => bundle.descriptors ?? []);

const walk = (properties: readonly PropertyDescriptor[]): PropertyDescriptor[] =>
    properties.flatMap(property => [property, ...walk(property.item?.properties ?? []), ...walk(property.properties ?? [])]);
const allProperties = descriptors.flatMap(descriptor => walk(descriptor.properties));
const property = (valueType: PropertyValueType, extra: Partial<PropertyDescriptor> = {}): PropertyDescriptor => ({ path: 'p', label: 'P', group: 'G', valueType, ...extra });

describe('when resolving the editor of every property type', () => {
    for (const valueType of Object.values(PropertyValueType)) {
        it(`should resolve an editor for a ${valueType} property`, () => (registry.resolve(property(valueType)) !== undefined).should.be.true);
    }

    it('should never resolve a box of JSON text for a value nothing describes', () => registry.resolve(property(PropertyValueType.Json))!.id.should.equal('undescribed'));
    it('should draw an object that describes its fields through its fields', () => registry.resolve(property(PropertyValueType.Object, { properties: [] }))!.id.should.equal('object'));
    it('should offer chips for up to four choices', () =>
        registry.resolve(property(PropertyValueType.Enum, { choices: [1, 2, 3, 4].map(value => ({ value, label: `${value}` })) }))!.id.should.equal('enum'));
    it('should offer a filterable dropdown for more than four', () =>
        registry.resolve(property(PropertyValueType.Enum, { choices: [1, 2, 3, 4, 5].map(value => ({ value, label: `${value}` })) }))!.id.should.equal('select'));
});

describe('when resolving the editor kinds the packages\' descriptors name', () => {
    const kinds = [...new Set(allProperties.flatMap(candidate => candidate.editorKind ? [candidate.editorKind] : []))];

    it('should have found the kinds', () => kinds.length.should.be.greaterThan(10));

    for (const kind of kinds) {
        it(`should resolve ${kind}`, () => registry.resolve(property(PropertyValueType.String, { editorKind: kind }))!.tier.should.equal('kind'));
    }

    it('should resolve every property of every in-repo package', () =>
        allProperties.filter(candidate => registry.resolve(candidate) === undefined).map(candidate => `${candidate.path}:${candidate.valueType}:${candidate.editorKind}`).should.deep.equal([]));
});

describe('when resolving the vocabulary and the editor kinds the editor has always drawn', () => {
    for (const kind of [...Object.values(PropertyEditorKind), ...studioEditorKinds]) {
        it(`should register ${kind}`, () => registry.has(kind).should.be.true);
    }
});

describe('when loading the editors', () => {
    for (const id of registry.ids) {
        it(`should load ${id} on demand`, async () => (typeof await registry.loaderOf(id)!()).should.equal('function'));
    }
});
