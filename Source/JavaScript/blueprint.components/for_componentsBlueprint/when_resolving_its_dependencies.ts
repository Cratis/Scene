// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { isPackageSelectionValid, resolvePackageDependencies } from '@cratis/scene.engine';
import { cratisComponentsPackageManifest } from '@cratis/scene.components';
import { defaultBlueprintManifest } from '@cratis/scene.blueprint.default';
import { componentsBlueprintManifest } from '../componentsBlueprint';
import { componentsBlueprintName } from '../packageName';

/** A styling package declaring nothing but itself - enough for `Cratis.Components` to depend on, and no more. */
const tailwind: ScenePackage = {
    name: 'Tailwind',
    version: '4.3.3',
    kind: PackageKind.Styling,
    dependencies: [],
    components: [],
    layouts: [],
    screenTemplates: [],
    dialogTemplates: [],
    themes: [],
};

/** The base component library both of this blueprint's dependencies are written against, at the version this repository pins. */
const primeReact: ScenePackage = {
    name: 'PrimeReact',
    version: '10.9.8',
    kind: PackageKind.ComponentLibrary,
    dependencies: [{ name: 'Tailwind' }],
    components: ['column', 'table', 'dialog'],
    layouts: [],
    screenTemplates: [],
    dialogTemplates: [],
    themes: [],
};

describe('when resolving its dependencies', () => {
    const catalog = [tailwind, primeReact, cratisComponentsPackageManifest, defaultBlueprintManifest, componentsBlueprintManifest];
    const selection = resolvePackageDependencies([componentsBlueprintName], catalog);
    const positionOf = (name: string) => selection.packages.indexOf(name);

    it('should be a valid selection', () => {
        isPackageSelectionValid(selection).should.be.true;
    });

    it('should order the blueprint it layers on before it', () => {
        positionOf('Cratis.Blueprint.Default').should.be.lessThan(positionOf(componentsBlueprintName));
    });

    it('should order the component library its templates are built from before it', () => {
        positionOf('Cratis.Components').should.be.lessThan(positionOf(componentsBlueprintName));
    });

    it('should pull in the packages its own dependencies need, transitively', () => {
        selection.added.should.contain('PrimeReact');
        selection.added.should.contain('Tailwind');
    });

    it('should report nothing missing', () => {
        selection.missing.should.deep.equal([]);
    });

    it('should report no version conflict', () => {
        selection.versionConflicts.should.deep.equal([]);
    });

    it('should report no cycle, even though both blueprints depend on the same library', () => {
        selection.cycles.should.deep.equal([]);
    });

    describe('and the default blueprint is not in the catalog', () => {
        const withoutTheDefaultBlueprint = resolvePackageDependencies(
            [componentsBlueprintName],
            [tailwind, primeReact, cratisComponentsPackageManifest, componentsBlueprintManifest],
        );

        it('should report it missing rather than silently ordering around it', () => {
            withoutTheDefaultBlueprint.missing.should.deep.equal([{ package: componentsBlueprintName, dependsOn: 'Cratis.Blueprint.Default' }]);
        });

        it('should not be a valid selection', () => {
            isPackageSelectionValid(withoutTheDefaultBlueprint).should.be.false;
        });
    });
});
