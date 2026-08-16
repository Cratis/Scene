// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render, screen } from '@testing-library/react';
import { SceneElementView, coreComponents, corePackage, mergePackageRegistries } from '@cratis/scene.react';
import { defaultBlueprint } from '../defaultBlueprint';
import { composeScreenElement, galleryComponentCatalog, galleryPreviewProfile, galleryScreen, resolveElementComponentNames } from '../gallery';

const registry = mergePackageRegistries([corePackage, defaultBlueprint]);

function renderGalleryScreen(name: string) {
    const galleryItem = galleryScreen(name)!;
    const element = resolveElementComponentNames(composeScreenElement(galleryItem), galleryPreviewProfile, galleryComponentCatalog);
    render(<SceneElementView element={element} registry={registry} resolveBinding={() => undefined} />);
}

function has(selector: string): boolean {
    return document.querySelector(selector) !== null;
}

describe('when rendering a gallery screen', () => {
    describe('and it is an application-shell screen', () => {
        beforeEach(() => {
            renderGalleryScreen('Dashboard');
        });

        it('should render the shell wrapper with the default static mode', () => {
            document.querySelector('.layout-wrapper')!.className.should.contain('layout-static');
        });

        it('should render the topbar', () => {
            has('.layout-topbar').should.equal(true);
        });

        it('should render the sidebar panel the mode CSS positions', () => {
            has('.layout-sidebar').should.equal(true);
        });

        it('should render the navigation the screen contributed', () => {
            screen.getAllByRole('link', { name: /Products/ }).length.should.be.greaterThan(0);
        });

        it('should render the seeded content rather than a placeholder', () => {
            screen.getAllByText('Revenue').length.should.be.greaterThan(0);
            screen.getAllByText('$284,120').length.should.be.greaterThan(0);
        });

        it('should register the core registry alongside the blueprint one', () => {
            Object.keys(coreComponents)
                .every(key => key in registry)
                .should.equal(true);
        });
    });

    describe('and it is a full-page screen', () => {
        beforeEach(() => {
            renderGalleryScreen('Login');
        });

        it('should render the chrome-less shell', () => {
            has('.layout-full-page').should.equal(true);
        });

        it('should render the branding aside beside the form', () => {
            has('.layout-full-page-aside').should.equal(true);
        });

        it('should not render an application topbar', () => {
            has('.layout-topbar').should.equal(false);
        });

        it('should render the form the template seeded', () => {
            screen.getAllByText('Sign in').length.should.be.greaterThan(0);
        });
    });
});
