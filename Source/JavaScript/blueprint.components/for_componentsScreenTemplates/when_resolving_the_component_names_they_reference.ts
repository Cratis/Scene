// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { resolveComponentName } from '@cratis/scene.engine';
import { composeScreenElement, defaultBlueprintName, distinctComponentNames } from '@cratis/scene.blueprint.default';
import { cratisComponentsPackageManifest } from '@cratis/scene.components';
import { ComponentName } from '../ComponentName';
import { CompositeName } from '../CompositeName';
import { componentsBlueprintCatalog, componentsBlueprintProfile, componentsGalleryScreens } from '../gallery';
import { componentsBlueprintName } from '../packageName';
import { componentsDialogTemplates } from '../templates';

/**
 * Every name a template writes has to resolve against the profile, or it renders as a dashed red box in
 * the middle of an otherwise fine page with nothing pointing back at the template that wrote it. The
 * catalog is built from the real manifests of the packages this blueprint depends on, so a name renamed
 * upstream fails here rather than in an application.
 */
describe('when resolving the component names they reference', () => {
    const fromScreens = distinctComponentNames(componentsGalleryScreens.map(composeScreenElement));
    const fromDialogs = distinctComponentNames(componentsDialogTemplates.flatMap(template => Object.values(template.content ?? {}).flat()));
    const names = [...new Set([...fromScreens, ...fromDialogs])].sort();
    const resolutions = names.map(name => ({ name, resolution: resolveComponentName(name, componentsBlueprintProfile, componentsBlueprintCatalog) }));

    it('should reference something', () => {
        names.should.not.be.empty;
    });

    it('should reference something from the dialog templates too', () => {
        fromDialogs.should.not.be.empty;
    });

    it('should resolve every referenced name against the profile', () => {
        resolutions
            .filter(entry => entry.resolution === undefined)
            .map(entry => entry.name)
            .should.be.empty;
    });

    it('should resolve its own page header to itself', () => {
        resolveComponentName(ComponentName.ArcPageHeader, componentsBlueprintProfile, componentsBlueprintCatalog)!.package.should.equal(componentsBlueprintName);
    });

    it('should reference every component it registers, so nothing is declared and then unused', () => {
        const referenced = new Set(names);
        Object.values(ComponentName)
            .filter(name => !referenced.has(name))
            .should.be.empty;
    });

    it('should resolve the shell components to the blueprint it layers on', () => {
        resolveComponentName('appShell', componentsBlueprintProfile, componentsBlueprintCatalog)!.package.should.equal(defaultBlueprintName);
    });

    it('should resolve the Arc-bound composites to the component library', () => {
        resolutions
            .filter(entry => (Object.values(CompositeName) as string[]).includes(entry.name))
            .filter(entry => entry.resolution?.package !== cratisComponentsPackageManifest.name)
            .map(entry => entry.name)
            .should.be.empty;
    });

    it('should resolve a name both libraries declare to the Arc-aware one, and record the other as shadowed', () => {
        const dataTable = resolveComponentName(CompositeName.DataTable, componentsBlueprintProfile, componentsBlueprintCatalog)!;
        dataTable.package.should.equal(cratisComponentsPackageManifest.name);
        dataTable.shadows.should.contain('PrimeReact');
    });

    it('should resolve the borrowed column to PrimeReact, since neither library declares one', () => {
        resolveComponentName('column', componentsBlueprintProfile, componentsBlueprintCatalog)!.package.should.equal('PrimeReact');
    });
});
