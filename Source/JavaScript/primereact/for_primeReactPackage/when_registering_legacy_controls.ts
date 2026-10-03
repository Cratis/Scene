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

    describe('and describing the chart type', () => {
        const type = findComponentDescriptor(catalog, 'PrimeReact:chart')!.properties.find(property => property.path === 'type')!;

        it('should provide the canonical string choices first', () => {
            type.choices!.slice(0, 8).map(choice => choice.value).should.deep.equal(['bar', 'line', 'pie', 'doughnut', 'polarArea', 'radar', 'bubble', 'scatter']);
        });

        it('should provide the legacy ordinals as numbers, in the order of the original enum', () => {
            type.choices!.slice(8).map(choice => choice.value).should.deep.equal([0, 1, 2, 3, 4, 5, 6, 7]);
        });

        it('should label each legacy ordinal with the type it stands for', () => {
            type.choices!.slice(8).map(choice => choice.label).should.deep.equal([
                'Bar (legacy 0)', 'Line (legacy 1)', 'Pie (legacy 2)', 'Doughnut (legacy 3)',
                'Polar area (legacy 4)', 'Radar (legacy 5)', 'Bubble (legacy 6)', 'Scatter (legacy 7)',
            ]);
        });

        it('should accept a stored legacy ordinal and a canonical name, and refuse anything else', () => {
            [validateValue(type, 4), validateValue(type, 'polarArea'), validateValue(type, 8), validateValue(type, '4'), validateValue(type, 'PolarArea')]
                .should.deep.equal([undefined, undefined, 'not one of the allowed choices', 'not one of the allowed choices', 'not one of the allowed choices']);
        });

        it('should have no two choices with the same value', () => {
            new Set(type.choices!.map(choice => choice.value)).size.should.equal(type.choices!.length);
        });
    });

    it('should accept any JSON chart data and options, with their numbers and nulls', () => {
        const properties = findComponentDescriptor(catalog, 'PrimeReact:chart')!.properties;
        const data = properties.find(property => property.path === 'data')!;
        const options = properties.find(property => property.path === 'options')!;
        [validateValue(data, { labels: ['A'], datasets: [{ data: [1, null, 2.5] }] }), validateValue(options, { scales: { y: { min: 0 } } })]
            .should.deep.equal([undefined, undefined]);
    });

    it('should accept scalar and null multi-state values without narrowing them', () => {
        const value = findComponentDescriptor(catalog, 'PrimeReact:multiStateCheckbox')!.properties.find(property => property.path === 'value')!;
        [validateValue(value, 'approved'), validateValue(value, 1), validateValue(value, false), validateValue(value, null), validateValue(value, { a: [1] })]
            .should.deep.equal([undefined, undefined, undefined, undefined, undefined]);
    });
});
