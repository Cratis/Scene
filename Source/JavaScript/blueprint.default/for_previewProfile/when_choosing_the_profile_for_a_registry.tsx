// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render } from '@testing-library/react';
import { ComponentRegistry, corePackage } from '@cratis/scene.react';
import { defaultBlueprintComponents } from '../defaultBlueprintComponents';
import { defaultBlueprintName } from '../packageName';
import { GalleryScreenPreview, TemplatePreviewState, galleryComponentCatalog, galleryPreviewProfile, galleryProfile, previewProfileFor } from '../gallery';
import { resolveComponentName } from '@cratis/scene.engine';
import { provideBrowserApis } from '../for_templatePreviewStates/given';

const stand = () => null;
const partial: ComponentRegistry = { ...corePackage.components, ...defaultBlueprintComponents };
const full: ComponentRegistry = { ...partial, 'PrimeReact:text': stand, 'Cratis.Components:dataPage': stand };
const sharedNames = ['text', 'button', 'card'];
const providers = (registry: ComponentRegistry) => sharedNames.map(name => resolveComponentName(name, previewProfileFor(registry), galleryComponentCatalog)!.package);

describe('when choosing the profile for a registry', () => {
    beforeEach(provideBrowserApis);
    afterEach(cleanup);

    it('should use the full gallery profile when every package it declares is implemented', () => previewProfileFor(full).should.equal(galleryProfile));
    it('should let PrimeReact provide the shared names with the full registry', () => providers(full).should.deep.equal(['PrimeReact', 'PrimeReact', 'PrimeReact']));
    it('should keep the partial profile with core and the blueprint only', () => previewProfileFor(partial).should.equal(galleryPreviewProfile));
    it('should let core provide the shared names with a partial registry', () => providers(partial).should.deep.equal(['core', 'core', 'core']));
    it('should keep the partial profile when a listed package implements nothing', () => previewProfileFor({ ...partial, 'PrimeReact:text': stand }).should.equal(galleryPreviewProfile));

    for (const name of ['Landing', 'ModuleWorkspace', 'FeatureSection', 'SliceSection']) {
        it(`should render ${name} with a partial registry and no placeholders`, () => {
            const { container } = render(<GalleryScreenPreview screenName={name} registry={partial} state={TemplatePreviewState.Populated} />);
            (container.querySelector('[data-scene-unresolved-component]') === null).should.equal(true);
        });
    }

    it('should name the blueprint as a package of the full profile', () => galleryProfile.packages.should.include(defaultBlueprintName));
});
