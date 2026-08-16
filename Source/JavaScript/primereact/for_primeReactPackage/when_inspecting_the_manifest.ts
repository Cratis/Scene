// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind } from '@cratis/scene.model';
import { primeReactPackageManifest } from '../primeReactPackage';

describe('when inspecting the manifest', () => {
    it('should be named the way a ui profile lists it', () => {
        primeReactPackageManifest.name.should.equal('PrimeReact');
    });

    it('should be a component library', () => {
        primeReactPackageManifest.kind.should.equal(PackageKind.ComponentLibrary);
    });

    it('should depend on Tailwind, because the wrappers lay themselves out with it', () => {
        primeReactPackageManifest.dependencies.should.deep.equal([{ name: 'Tailwind' }]);
    });

    it('should name the module a host imports it from', () => {
        primeReactPackageManifest.module!.should.equal('@cratis/scene.primereact');
    });

    it('should provide no layouts, which belong to a blueprint package', () => {
        primeReactPackageManifest.layouts.should.deep.equal([]);
    });

    it('should provide no screen templates, which belong to a blueprint package', () => {
        primeReactPackageManifest.screenTemplates.should.deep.equal([]);
    });

    it('should provide no dialog templates, which belong to a blueprint package', () => {
        primeReactPackageManifest.dialogTemplates.should.deep.equal([]);
    });

    it('should declare the names Screenplay screen directives compile to', () => {
        for (const name of ['table', 'column', 'title', 'field', 'section', 'summary', 'action']) {
            primeReactPackageManifest.components.should.contain(name);
        }
    });
});
