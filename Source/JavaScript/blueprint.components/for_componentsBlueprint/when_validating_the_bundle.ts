// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind } from '@cratis/scene.model';
import { validatePackageBundle } from '@cratis/scene.react';
import { componentsBlueprint, componentsBlueprintManifest } from '../componentsBlueprint';
import { componentsBlueprintName } from '../packageName';

describe('when validating the bundle', () => {
    const problems = validatePackageBundle(componentsBlueprint);

    it('should report no problems', () => {
        problems.should.be.empty;
    });

    it('should declare itself a blueprint', () => {
        componentsBlueprintManifest.kind.should.equal(PackageKind.Blueprint);
    });

    it('should be named as a blueprint package', () => {
        componentsBlueprintManifest.name.should.equal(componentsBlueprintName);
    });

    it('should depend on the blueprint it layers on and the library its templates are built from', () => {
        componentsBlueprintManifest.dependencies.map(dependency => dependency.name).should.deep.equal(['Cratis.Blueprint.Default', 'Cratis.Components']);
    });

    it('should ship no layout of its own, because it reuses the default blueprint shell', () => {
        componentsBlueprintManifest.layouts.should.be.empty;
    });

    it('should provide no layout either, so the manifest and the bundle agree about that', () => {
        (componentsBlueprint.layouts ?? []).should.be.empty;
    });

    it('should ship no theme, because the shell it themes is not its own', () => {
        componentsBlueprintManifest.themes.should.be.empty;
    });

    it('should declare a screen template for every one it provides', () => {
        componentsBlueprintManifest.screenTemplates.should.deep.equal((componentsBlueprint.screenTemplates ?? []).map(template => template.name));
    });

    it('should declare a dialog template for every one it provides', () => {
        componentsBlueprintManifest.dialogTemplates.should.deep.equal((componentsBlueprint.dialogTemplates ?? []).map(template => template.name));
    });

    it('should ship a gallery screen for every screen template', () => {
        (componentsBlueprint.screens ?? []).map(screen => screen.name).should.deep.equal(componentsBlueprintManifest.screenTemplates);
    });

    it('should name the module a host imports it from', () => {
        componentsBlueprintManifest.module!.should.equal('@cratis/scene.blueprint.components');
    });
});
