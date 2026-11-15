// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { findComponentDescriptor } from '@cratis/scene.engine';
import { corePackage } from '@cratis/scene.react';
import { primeReactPackage } from '@cratis/scene.primereact';
import { cratisComponentsPackage } from '@cratis/scene.components';
import { createScreenEditorRuntime } from '../screenEditorRuntime';
import { placementGroup } from '../withPlacementProperties';

const runtime = createScreenEditorRuntime([corePackage, cratisComponentsPackage], { name: 'test', packages: [] } as never);

describe('when creating the runtime from the packages in play', () => {
    it('should describe a component a package wrote a descriptor for', () => (findComponentDescriptor(runtime.catalog, 'core:button') !== undefined).should.be.true);
    it('should describe a component nobody wrote a descriptor for', () => (findComponentDescriptor(runtime.catalog, 'core:text') !== undefined).should.be.true);
    it('should let every component be placed on a canvas', () =>
        runtime.descriptors.every(descriptor => descriptor.properties.some(property => property.group === placementGroup)).should.be.true);
    it('should know the components the packages declare', () => runtime.isKnownComponent('button').should.be.true);
    it('should not know one they do not', () => runtime.isKnownComponent('hologram').should.be.false);
    it('should resolve every declared component to something that renders', () => (Object.keys(runtime.registry).length > 0).should.be.true);
});

describe('when describing the action component', () => {
    const action = findComponentDescriptor(runtime.catalog, 'core:action')!;

    it('should keep what Scene describes', () => action.properties.some(property => property.path === 'command').should.be.true);
    it('should describe where its slice opens, as Scene does since 5', () => action.properties.some(property => property.path === 'opens').should.be.true);
    it('should no longer add a presentation of its own', () => action.properties.some(property => property.path === 'presentation').should.be.false);
});

describe('when describing an outlet of actions', () => {
    const items = findComponentDescriptor(runtime.catalog, 'core:outletItems')!.properties.find(property => property.path === 'items')!;

    it('should let an item say what kind of item it is', () => items.item!.properties.some(property => property.path === 'kind').should.be.true);
    it('should take the id as the item identity, not a field', () => items.item!.properties.some(property => property.path === 'id').should.be.false);
});

describe('when several packages declare the same component name', () => {
    const paths = (runtime: ReturnType<typeof createScreenEditorRuntime>, name: string) => findComponentDescriptor(runtime.catalog, name)!.properties.map(property => property.path);
    const withOrder = (packages: string[]) => createScreenEditorRuntime([corePackage, primeReactPackage], { name: 'p', targetPlatform: 'web', packages } as never);

    it('should describe the bare name, which Scene alone cannot choose between', () => (findComponentDescriptor(withOrder(['core', 'PrimeReact']).catalog, 'button') !== undefined).should.be.true);
    it('should use the package the profile lists last, as the renderer does', () => {
        const runtime = withOrder(['core', 'PrimeReact']);
        paths(runtime, 'button').should.deep.equal(paths(runtime, 'PrimeReact:button'));
    });
    it('should follow the profile when the order changes', () => {
        const runtime = withOrder(['PrimeReact', 'core']);
        paths(runtime, 'button').should.deep.equal(paths(runtime, 'core:button'));
    });
    it('should keep the qualified names as they were', () => (findComponentDescriptor(withOrder(['core', 'PrimeReact']).catalog, 'core:button') !== undefined).should.be.true);
});
