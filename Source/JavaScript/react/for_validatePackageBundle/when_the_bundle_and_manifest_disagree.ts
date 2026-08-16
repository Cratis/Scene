// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { ScenePackageBundle, componentRegistryKey, validatePackageBundle } from '../index';
import { CoreText } from '../core';

function manifestFor(components: string[], layouts: string[] = [], themes: string[] = [], screenTemplates: string[] = []): ScenePackage {
    return {
        name: 'Test',
        version: '1.0.0',
        kind: PackageKind.ComponentLibrary,
        dependencies: [],
        components,
        layouts,
        screenTemplates,
        dialogTemplates: [],
        themes,
    };
}

describe('when the bundle and manifest disagree', () => {
    const declaredButNotRegistered = validatePackageBundle({
        manifest: manifestFor(['text', 'missing']),
        components: { [componentRegistryKey('Test', 'text')]: CoreText },
    } as ScenePackageBundle);

    const registeredButNotDeclared = validatePackageBundle({
        manifest: manifestFor([]),
        components: { [componentRegistryKey('Test', 'text')]: CoreText },
    } as ScenePackageBundle);

    const layoutDeclaredButNotProvided = validatePackageBundle({
        manifest: manifestFor([], ['AppShell']),
        components: {},
    } as ScenePackageBundle);

    const screenTemplateDeclaredButNotProvided = validatePackageBundle({
        manifest: manifestFor([], [], [], ['ModuleWorkspace']),
        components: {},
    } as ScenePackageBundle);

    const themeDeclaredButNotProvided = validatePackageBundle({
        manifest: manifestFor([], [], ['Midnight']),
        components: {},
    } as ScenePackageBundle);

    it('should report a component the manifest declares without an implementation', () => {
        declaredButNotRegistered.should.have.lengthOf(1);
        declaredButNotRegistered[0].should.contain("'missing'");
    });

    it('should report a component registered without being declared', () => {
        registeredButNotDeclared.should.have.lengthOf(1);
        registeredButNotDeclared[0].should.contain('Test:text');
    });

    it('should report a layout the manifest declares without a definition', () => {
        layoutDeclaredButNotProvided.should.have.lengthOf(1);
        layoutDeclaredButNotProvided[0].should.contain("'AppShell'");
    });

    it('should report a screen template the manifest declares without a definition', () => {
        screenTemplateDeclaredButNotProvided.should.have.lengthOf(1);
        screenTemplateDeclaredButNotProvided[0].should.contain("'ModuleWorkspace'");
    });

    it('should report a theme the manifest declares without a definition', () => {
        themeDeclaredButNotProvided.should.have.lengthOf(1);
        themeDeclaredButNotProvided[0].should.contain("'Midnight'");
    });
});
