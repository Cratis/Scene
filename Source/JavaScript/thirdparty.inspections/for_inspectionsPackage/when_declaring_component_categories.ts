// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { componentCategories } from '@cratis/scene.model';
import { componentRegistryKey, validateComponentMetadata } from '@cratis/scene.react';
import { inspectionsPackage } from '../index';

// CMP1: every component the package registers declares a category, so a component picker can group it.
describe('when declaring component categories', () => {
    const registered = [...new Set([
        ...inspectionsPackage.manifest.components.map(name => componentRegistryKey(inspectionsPackage.manifest.name, name)),
        ...Object.keys(inspectionsPackage.components),
    ])];
    const described = new Map((inspectionsPackage.descriptors ?? []).map(descriptor => [descriptor.component, descriptor]));

    it('should describe every registered component', () => registered.filter(key => !described.has(key)).should.deep.equal([]));

    it('should declare a category from the shared vocabulary for every registered component', () =>
        registered.filter(key => !componentCategories.includes(described.get(key)?.category ?? '')).should.deep.equal([]));

    it('should report no component metadata problem', () => validateComponentMetadata(inspectionsPackage).should.deep.equal([]));
});
