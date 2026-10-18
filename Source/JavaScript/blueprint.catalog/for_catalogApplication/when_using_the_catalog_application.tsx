// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll } from 'vitest';
import { interactive, provideBrowserApis } from './given';

const sidebar = () => screen.getByRole('navigation', { name: 'Sidebar' });
const topbar = () => screen.getByRole('navigation', { name: 'Modules' });
const labels = (nav: HTMLElement) => Array.from(nav.querySelectorAll('a')).map(item => item.textContent?.trim());
const page = () => document.querySelector('[data-scene-outlet="primary"]')!;
const onPage = () => page().getAttribute('data-scene-screen');
const headings = () => Array.from(page().querySelectorAll('h1')).map(heading => heading.textContent);

// Spec Part B 3.x as an application: the navigation, the screens a user moves between, what the buttons and rows do, and what the data looks like.
describe('when using the Catalog application', () => {
    beforeAll(provideBrowserApis);
    // Search, sort, page and selection live in the address, so a test must leave the address as it found it.
    afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

    describe('and it starts on catalog.overview', () => {
        beforeEach(() => { render(interactive('catalog.overview')); });

        it('should name the module in the topbar and show the logo', () => {
            labels(topbar()).should.deep.equal(['Catalog']);
            document.querySelector('.layout-logo')!.textContent!.should.contain('Catalog');
        });

        it('should list the places of the blueprint in the sidebar', () => labels(sidebar()).should.deep.equal(['Overview', 'Products', 'Categories']));
    });

    describe('and the user goes to catalog.overview', () => {
        beforeEach(() => { render(interactive('catalog.overview')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('catalog.overview');
            headings().should.include('Catalog overview');
            page().textContent!.should.contain('Active products').and.contain('Out of stock').and.contain('Average margin').and.contain('raised the price of FIT-210');
        });
    });

    describe('and the user goes to catalog.products', () => {
        beforeEach(() => { render(interactive('catalog.products')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('catalog.products');
            headings().should.include('Products');
            page().textContent!.should.contain('FIT-210').and.contain('Compression fitting 22 mm').and.contain('Fittings').and.contain('Low stock');
        });
    });

    describe('and the user goes to catalog.record', () => {
        beforeEach(() => { render(interactive('catalog.record')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('catalog.record');
            headings().should.include('Compression fitting 22 mm');
            page().textContent!.should.contain('Price').and.contain('In stock').and.contain('Margin').and.contain('FIT-210-N').and.contain('Grace Hopper');
        });
    });

    describe('and the user goes to catalog.categories', () => {
        beforeEach(() => { render(interactive('catalog.categories')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('catalog.categories');
            headings().should.include('Categories');
            page().textContent!.should.contain('Fittings').and.contain('Safety').and.contain('Hidden');
        });
    });

    describe('and the user starts a new record', () => {
        beforeEach(() => { render(interactive('catalog.products')); });

        it('should open the new product dialog', () => {
            fireEvent.click(screen.getByRole('button', { name: 'New product' }));
            screen.getByRole('dialog').getAttribute('data-scene-dialog')!.should.equal('CatalogQuickCreateProduct');
        });
    });

    describe('and the user chooses a row', () => {
        beforeEach(() => {
            render(interactive('catalog.products'));
            fireEvent.click(page().querySelector('.foundation-table tbody tr input[type="radio"]')!);
        });

        it('should open the record page with its key facts', () => {
            onPage()!.should.equal('catalog.record');
            headings().should.deep.equal(['Compression fitting 22 mm']);
            page().textContent!.should.contain('Price').and.contain('In stock').and.contain('Variants').and.contain('FIT-210-N').and.contain('Price history');
        });
    });
});
