// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createDescriptorCatalog, findComponentDescriptor, resolveComponentName, validateValue } from '@cratis/scene.engine';
import { UiProfile } from '@cratis/scene.model';
import { componentRegistryKey } from '@cratis/scene.react';
import { primeReactPackage, primeReactPackageManifest } from '../primeReactPackage';

const profile: UiProfile = { name: 'web', targetPlatform: 'web', packages: ['PrimeReact'] };

describe('when registering legacy controls', () => {
    const catalog = createDescriptorCatalog(primeReactPackage.descriptors);

    for (const name of ['chart', 'multiStateCheckbox']) {
        describe(`and the control is '${name}'`, () => {
            it('should be declared by the package', () => {
                primeReactPackageManifest.components.should.contain(name);
            });

            it('should have a registered renderer', () => {
                primeReactPackage.components[componentRegistryKey('PrimeReact', name)].should.not.be.undefined;
            });

            it('should resolve from the bare component name', () => {
                resolveComponentName(name, profile, { PrimeReact: primeReactPackageManifest.components })!.package.should.equal('PrimeReact');
            });

            it('should have an editable descriptor in the package catalog', () => {
                findComponentDescriptor(catalog, `PrimeReact:${name}`)?.properties.should.not.be.empty;
            });
        });
    }

    it('should provide canonical string choices for chart type', () => {
        findComponentDescriptor(catalog, 'PrimeReact:chart')!.properties.find(property => property.path === 'type')!.choices!
            .map(choice => choice.value).should.deep.equal(['bar', 'line', 'pie', 'doughnut', 'polarArea', 'radar', 'bubble', 'scatter']);
    });

    it('should accept scalar and null multi-state values without narrowing them', () => {
        const value = findComponentDescriptor(catalog, 'PrimeReact:multiStateCheckbox')!.properties.find(property => property.path === 'value')!;
        [validateValue(value, 'approved'), validateValue(value, 1), validateValue(value, false), validateValue(value, null)].should.deep.equal([undefined, undefined, undefined, undefined]);
    });
});
