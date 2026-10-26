// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render } from '@testing-library/react';
import { PrimeReactProvider } from '@primereact/core';
import { PackageKind, ScreenTemplate } from '@cratis/scene.model';
import { resolveComponentName } from '@cratis/scene.engine';
import { ScenePackageBundle, corePackage, resolvePackageHost } from '@cratis/scene.react';
import { primeReactPackage } from '@cratis/scene.primereact';
import { defaultBlueprint } from '../defaultBlueprint';
import { defaultBlueprintName } from '../packageName';
import { galleryComponentCatalog, galleryDialogTemplates, galleryScreenTemplates, GalleryScreenPreview, TemplatePreviewState } from '../gallery';
import { provideBrowserApis } from './given';

const empty = (name: string, kind: PackageKind): ScenePackageBundle => ({
    manifest: { name, version: '3.0.0', kind, dependencies: [], components: [], layouts: [], screenTemplates: [], dialogTemplates: [], themes: [] },
    components: {},
});
const borrowsPrimeReact = (template: ScreenTemplate) => template.metadata?.compatibility?.packages?.some(requirement => requirement.name === 'PrimeReact') ?? false;
const foundation = galleryScreenTemplates.filter(template => !borrowsPrimeReact(template));
const borrowing = galleryScreenTemplates.filter(borrowsPrimeReact);

const resolve = (packages: string[]) => resolvePackageHost({
    profile: { name: 'App', targetPlatform: 'web', packages },
    bundles: [corePackage, empty('Cratis.Components', PackageKind.ComponentLibrary), empty('Tailwind', PackageKind.Styling), primeReactPackage, defaultBlueprint],
    policy: { allowExecutableImports: false, allowNetworkAssets: false },
    sceneVersion: '4.13.0',
});

describe('when choosing the default or the widget mode', () => {
    beforeEach(provideBrowserApis);
    afterEach(cleanup);

    describe('and the profile has no PrimeReact', () => {
        const host = resolve(['Cratis.Blueprint.Default']);
        const registry = { ...corePackage.components, ...host.components };

        it('should not activate PrimeReact', () => host.bundles.some(bundle => bundle.manifest.name === 'PrimeReact').should.equal(false));
        it('should offer every foundation template as compatible', () => host.templates.filter(entry => foundation.some(template => template.name === entry.name) && !entry.compatible).map(entry => entry.name).should.deep.equal([]));
        it('should offer exactly the five neutral templates without PrimeReact among the former gallery templates', () => {
            const neutral = ['Landing', 'ModuleWorkspace', 'FeatureSection', 'SliceSection'];
            neutral.every(name => foundation.some(template => template.name === name)).should.equal(true);
            borrowing.map(template => template.name).should.not.include.members(neutral);
            const confirm = host.templates.find(entry => entry.name === 'ConfirmDialog' && entry.package === defaultBlueprintName);
            (confirm?.compatible === true).should.equal(true);
            (galleryDialogTemplates.find(template => template.name === 'ConfirmDialog')!.metadata?.compatibility?.packages ?? []).should.be.empty;
        });
        it('should offer every widget-borrowing template as unavailable with an actionable message', () => {
            const entries = host.templates.filter(entry => borrowing.some(template => template.name === entry.name));
            entries.length.should.equal(borrowing.length);
            entries.every(entry => !entry.compatible && entry.problems.some(problem => problem.includes('Add `packages PrimeReact` to the ui profile'))).should.equal(true);
        });
        it('should keep the foundation templates free of components only PrimeReact provides', () => {
            const profile = { name: 'App', targetPlatform: 'web' as const, packages: ['core', 'Cratis.Components', defaultBlueprintName] };
            const catalog = { ...galleryComponentCatalog };
            delete catalog.PrimeReact;
            const names = new Set(JSON.stringify(foundation).match(/"componentName":"[^"]+"/g)?.map(match => match.slice(17, -1)));
            [...names].filter(name => resolveComponentName(name, profile, catalog) === undefined).should.deep.equal([]);
        });

        for (const template of foundation) {
            it(`should render ${template.name} without placeholders`, () => {
                const { container } = render(<GalleryScreenPreview screenName={template.name} registry={registry} state={TemplatePreviewState.Populated} />);
                (container.querySelector('[data-scene-unresolved-component]') === null).should.equal(true);
            });
        }
    });

    describe('and the profile includes PrimeReact', () => {
        const host = resolve(['PrimeReact', 'Cratis.Blueprint.Default']);
        const registry = { ...corePackage.components, ...host.components };

        it('should make every gallery template compatible', () => host.templates.filter(entry => entry.package === defaultBlueprintName && !entry.compatible).map(entry => entry.name).should.deep.equal([]));

        for (const template of galleryScreenTemplates) {
            it(`should render ${template.name} without placeholders and with its shell`, () => {
                const { container } = render(<PrimeReactProvider><GalleryScreenPreview screenName={template.name} registry={registry} state={TemplatePreviewState.Populated} /></PrimeReactProvider>);
                (container.querySelector('[data-scene-unresolved-component]') === null).should.equal(true);
                container.querySelectorAll('[data-scene-id="topbar"], .layout-full-page, .layout-wrapper').length.should.be.greaterThan(0);
            });
        }
    });
});
