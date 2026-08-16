// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind } from '@cratis/scene.model';
import { validatePackageBundle } from '@cratis/scene.react';
import { defaultBlueprint, defaultBlueprintManifest } from '../defaultBlueprint';
import { defaultBlueprintName } from '../packageName';

describe('when validating the bundle', () => {
    const problems = validatePackageBundle(defaultBlueprint);

    it('should report no problems', () => {
        problems.should.be.empty;
    });

    it('should declare itself a blueprint', () => {
        defaultBlueprintManifest.kind.should.equal(PackageKind.Blueprint);
    });

    it('should be named as a blueprint package', () => {
        defaultBlueprintManifest.name.should.equal(defaultBlueprintName);
    });

    it('should depend on the component libraries its shells are built from', () => {
        defaultBlueprintManifest.dependencies.map(dependency => dependency.name).should.deep.equal(['PrimeReact', 'Cratis.Components']);
    });

    it('should declare only application shells as layouts', () => {
        defaultBlueprintManifest.layouts.should.deep.equal(['AppShell', 'FullPage']);
    });

    it('should declare a screen template for every one it provides', () => {
        defaultBlueprintManifest.screenTemplates.should.deep.equal((defaultBlueprint.screenTemplates ?? []).map(template => template.name));
    });

    it('should declare a dialog template for every one it provides', () => {
        defaultBlueprintManifest.dialogTemplates.should.deep.equal((defaultBlueprint.dialogTemplates ?? []).map(template => template.name));
    });

    it('should ship a screen for every screen template', () => {
        (defaultBlueprint.screens ?? []).map(screen => screen.name).should.deep.equal(defaultBlueprintManifest.screenTemplates);
    });
});
