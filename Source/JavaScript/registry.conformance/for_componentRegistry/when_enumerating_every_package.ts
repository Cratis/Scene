// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor, componentCategories } from '@cratis/scene.model';
import { ScenePackageBundle, componentRegistryKey, validateComponentMetadata } from '@cratis/scene.react';
import { inRepositoryPackages } from './given/inRepositoryPackages';

const registered = (bundle: ScenePackageBundle) => [...new Set([
    ...bundle.manifest.components.map(name => componentRegistryKey(bundle.manifest.name, name)),
    ...Object.keys(bundle.components),
])];

describe('when enumerating every package registry in the repository', () => {
    it('should find the packages', () => inRepositoryPackages.length.should.be.greaterThan(5));

    it('should find the components', () => inRepositoryPackages.flatMap(registered).length.should.be.greaterThan(150));

    for (const bundle of inRepositoryPackages) {
        describe(`and the ${bundle.manifest.name} package`, () => {
            const descriptors = new Map((bundle.descriptors ?? []).map((descriptor): [string, ComponentDescriptor] => [descriptor.component, descriptor]));

            it('should describe every registered component', () => registered(bundle).filter(key => !descriptors.has(key)).should.deep.equal([]));

            it('should declare a category for every registered component (CMP1)', () =>
                registered(bundle).filter(key => !descriptors.get(key)?.category).should.deep.equal([]));

            it('should declare a category from the shared vocabulary', () =>
                [...descriptors.values()].filter(descriptor => !componentCategories.includes(descriptor.category ?? '')).map(descriptor => descriptor.component).should.deep.equal([]));

            it('should declare an icon and a display name for every registered component', () =>
                registered(bundle).filter(key => !descriptors.get(key)?.icon || !descriptors.get(key)?.displayName).should.deep.equal([]));

            it('should report no component metadata problem', () => validateComponentMetadata(bundle).should.deep.equal([]));
        });
    }
});
