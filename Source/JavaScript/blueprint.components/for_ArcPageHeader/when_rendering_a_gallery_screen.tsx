// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render, screen } from '@testing-library/react';
import { PrimeReactProvider } from '@primereact/core';
import { SceneElement } from '@cratis/scene.model';
import { SceneElementView } from '@cratis/scene.react';
import { clearBindings, registerQuery } from '@cratis/scene.components';
import { composeScreenElement, resolveElementComponentNames } from '@cratis/scene.blueprint.default';
import { componentsBlueprintCatalog, componentsBlueprintProfile, componentsGalleryScreen, componentsPreviewRegistry } from '../gallery';
import { SampleBindingName, arcPageHeader } from '../templates';

class AllInvoices {}

// These pages render inside the default blueprint's shell, which reaches for PrimeReact directly. Every
// PrimeReact 11 component resolves its configuration through `PrimeReactProvider` and throws without one,
// so the provider is what makes the render happen at all rather than a styling nicety. No preset is handed
// over: these specs assert structure and text, and a theme would only add runtime CSS nothing here reads.
function renderElement(element: SceneElement) {
    render(
        <PrimeReactProvider>
            <SceneElementView
                element={resolveElementComponentNames(element, componentsBlueprintProfile, componentsBlueprintCatalog)}
                registry={componentsPreviewRegistry}
                resolveBinding={() => undefined}
            />
        </PrimeReactProvider>,
    );
}

function has(selector: string): boolean {
    return document.querySelector(selector) !== null;
}

describe('when rendering a gallery screen', () => {
    describe('and nothing is registered', () => {
        beforeEach(() => {
            clearBindings();
            renderElement(composeScreenElement(componentsGalleryScreen('DataListPage')!));
        });

        afterEach(() => clearBindings());

        it('should render inside the shell the blueprint it depends on provides', () => {
            has('.layout-topbar').should.equal(true);
        });

        it('should render the page header this blueprint contributes', () => {
            has('.layout-page-header').should.equal(true);
        });

        it('should render the trail derived from the section and the title', () => {
            screen.getAllByLabelText('Breadcrumb').some(element => element.textContent === 'Billing › Invoices').should.equal(true);
        });

        it('should say which query a host still has to register', () => {
            screen.getAllByText('No query registered as AllInvoices').length.should.be.greaterThan(0);
        });

        it('should render the unbound data page as a placeholder naming the binding it wanted', () => {
            screen.getAllByText("Unresolved query binding 'AllInvoices' on Cratis.Components:dataPage").length.should.be.greaterThan(0);
        });

        it('should render no unresolved-component fallback, because every name the page writes resolves', () => {
            has('[data-scene-unresolved-component]').should.equal(false);
        });
    });

    describe('and the header binding is registered', () => {
        beforeEach(() => {
            clearBindings();
            registerQuery(SampleBindingName.AllInvoices, AllInvoices);
            renderElement(arcPageHeader('bound-header', { title: 'Invoices', section: 'Billing', query: SampleBindingName.AllInvoices }));
        });

        afterEach(() => clearBindings());

        it('should report the binding as resolved rather than missing', () => {
            screen.getAllByText('Bound to query AllInvoices').length.should.be.greaterThan(0);
        });

        it('should mark the header as bound, so a preview can be scanned for what is still unwired', () => {
            has('[data-scene-binding-state="bound"]').should.equal(true);
        });
    });
});
