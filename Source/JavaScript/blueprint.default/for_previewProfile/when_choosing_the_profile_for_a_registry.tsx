// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render } from '@testing-library/react';
import { ComponentRegistry, corePackage } from '@cratis/scene.react';
import { defaultBlueprintComponents } from '../defaultBlueprintComponents';
import { defaultBlueprintName } from '../packageName';
import { GalleryScreenPreview, TemplatePreviewState, galleryComponentCatalog, galleryPreviewProfile, galleryProfile, previewProfileFor } from '../gallery';
import { primeReactComponentNames } from '../gallery/dependencyComponentNames';
import { resolveComponentName } from '@cratis/scene.engine';
import { provideBrowserApis } from '../for_templatePreviewStates/given';

const stand = () => null;
const partial: ComponentRegistry = { ...corePackage.components, ...defaultBlueprintComponents };
const primeReact = Object.fromEntries(primeReactComponentNames.map(name => [`PrimeReact:${name}`, stand]));
const full: ComponentRegistry = { ...partial, ...primeReact, 'Cratis.Components:dataPage': stand };
const sharedNames = ['text', 'button', 'card'];
const providers = (registry: ComponentRegistry) => sharedNames.map(name => resolveComponentName(name, previewProfileFor(registry), galleryComponentCatalog)!.package);

describe('when choosing the profile for a registry', () => {
    beforeEach(provideBrowserApis);
    afterEach(cleanup);

    it('should use the full gallery profile when every package it declares is implemented', () => previewProfileFor(full).should.equal(galleryProfile));
    it('should let PrimeReact provide the shared names it declares with the full registry', () => providers(full).should.deep.equal(['PrimeReact', 'PrimeReact', 'PrimeReact']));
    it('should resolve differently from the partial registry for every shared name PrimeReact declares', () => primeReactComponentNames.filter(name => sharedNames.includes(name)).forEach(name => resolveComponentName(name, previewProfileFor(full), galleryComponentCatalog)!.package.should.not.equal(resolveComponentName(name, previewProfileFor(partial), galleryComponentCatalog)!.package)));
    it('should keep the partial profile with core and the blueprint only', () => previewProfileFor(partial).should.equal(galleryPreviewProfile));
    it('should let core provide the shared names with a partial registry', () => providers(partial).should.deep.equal(['core', 'core', 'core']));
    it('should keep the partial profile when a listed package implements nothing', () => previewProfileFor({ ...partial, 'PrimeReact:text': stand, 'Cratis.Components:dataPage': stand }).should.equal(galleryPreviewProfile));

    for (const name of ['Landing', 'ModuleWorkspace', 'FeatureSection', 'SliceSection']) {
        it(`should render ${name} with a partial registry and no placeholders`, () => {
            const { container } = render(<GalleryScreenPreview screenName={name} registry={partial} state={TemplatePreviewState.Populated} />);
            (container.querySelector('[data-scene-unresolved-component]') === null).should.equal(true);
        });
    }

    it('should render Landing without placeholders when PrimeReact has text but not card', () => {
        const partlyLoaded = { ...partial, 'PrimeReact:text': stand, 'Cratis.Components:dataPage': stand };
        previewProfileFor(partlyLoaded).should.equal(galleryPreviewProfile);
        const { container } = render(<GalleryScreenPreview screenName='Landing' registry={partlyLoaded} state={TemplatePreviewState.Populated} />);
        (container.querySelector('[data-scene-unresolved-component]') === null).should.equal(true);
    });

    it('should name the blueprint as a package of the full profile', () => galleryProfile.packages.should.include(defaultBlueprintName));
});
