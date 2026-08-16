// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { componentRegistryKey } from '@cratis/scene.react';
import { primeReactComponents } from '../primeReactComponents';
import { primeReactPackageManifest } from '../primeReactPackage';

describe('when inspecting the registry', () => {
    const keys = Object.keys(primeReactComponents);

    it('should register an implementation for every declared component name', () => {
        const missing = primeReactPackageManifest.components.filter((name) => primeReactComponents[componentRegistryKey('PrimeReact', name)] === undefined);
        missing.should.deep.equal([]);
    });

    it('should declare every registered component name', () => {
        const declared = new Set(primeReactPackageManifest.components);
        const undeclared = keys.filter((key) => !declared.has(key.slice('PrimeReact:'.length)));
        undeclared.should.deep.equal([]);
    });

    it('should qualify every registry key with the package name', () => {
        keys.filter((key) => !key.startsWith('PrimeReact:')).should.deep.equal([]);
    });

    it('should declare every component name exactly once', () => {
        primeReactPackageManifest.components.should.have.lengthOf(new Set(primeReactPackageManifest.components).size);
    });

    it('should name every component in lowerCamelCase', () => {
        primeReactPackageManifest.components.filter((name) => !/^[a-z][a-zA-Z]*$/.test(name)).should.deep.equal([]);
    });
});
