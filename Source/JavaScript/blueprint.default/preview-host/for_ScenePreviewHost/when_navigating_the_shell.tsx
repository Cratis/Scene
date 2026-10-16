// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach } from 'vitest';
import { DestinationReference } from '@cratis/scene.model';
import { NavigationActivation } from '@cratis/scene.react';
import { navigationEntries } from '../../gallery/navigation';
import { galleryApplication, galleryComposition } from '../galleryApplication';
import { preview } from './when_previewing_a_module';

const topbar = () => screen.getByRole('navigation', { name: 'Modules' });
const sidebar = () => screen.getByRole('navigation', { name: 'Sidebar' });
const trail = () => screen.getByRole('navigation', { name: 'Breadcrumb' });
const page = () => document.querySelector('[data-scene-outlet="primary"]')!.getAttribute('data-scene-screen');
const current = (nav: HTMLElement) => Array.from(nav.querySelectorAll('[aria-current="page"]')).map(item => item.textContent?.trim());
const galleryMenu = () => document.querySelector<HTMLElement>('.layout-sidebar')!;
const nothing = () => undefined;
const crumbs = () => Array.from(trail().querySelectorAll('a, [aria-current]')).map(item => item.textContent?.trim());

/** The gallery as the application: its menu entries, breadcrumbs, logo and user menu are the controls under test. */
function galleryPreview(props: Parameters<typeof preview>[0] = {}) {
    return preview({ document: galleryApplication(), composition: galleryComposition, target: { application: 'Gallery' }, ...props });
}

describe('when navigating the shell of a preview', () => {
    beforeAll(() => {
        // jsdom has no layout engine or media queries; the shell's components that measure themselves are given a size and a media list that never matches.
        globalThis.ResizeObserver ??= class { observe = nothing; unobserve = nothing; disconnect = nothing; } as unknown as typeof ResizeObserver;
        window.matchMedia ??= (() => ({ matches: false, addEventListener: nothing, removeEventListener: nothing, addListener: nothing, removeListener: nothing })) as unknown as typeof window.matchMedia;
    });

    afterEach(cleanup);

    describe('and an item of the sidebar is clicked', () => {
        let before: string;
        beforeEach(() => {
            before = globalThis.location.href;
            render(preview());
            fireEvent.click(within(sidebar()).getByText('Customers'));
        });

        it('should swap the content slot to the destination', () => document.querySelector('[data-page="customers"]')!.textContent!.should.contain('Customers'));
        it('should make the item the active one', () => current(sidebar()).should.deep.equal(['Customers']));
        it('should follow with the breadcrumb', () => crumbs().should.deep.equal(['Sales', 'Customers']));
        it('should record the screen in the history of the host', () => page()!.should.equal('sales.customers'));
        it('should not write the address of the page that hosts the preview', () => globalThis.location.href.should.equal(before));
    });

    describe('and the module of the topbar is clicked', () => {
        beforeEach(() => {
            render(preview());
            fireEvent.click(within(topbar()).getByText('Support'));
        });

        it('should swap the content slot to its first feature', () => page()!.should.equal('support.tickets'));
        it('should activate the module in the topbar', () => current(topbar()).should.deep.equal(['Support']));
        it('should show the trail of the module and its feature', () => crumbs().should.deep.equal(['Support', 'Tickets']));
    });

    describe('and a crumb of the trail is clicked', () => {
        let before: string;
        beforeEach(() => {
            before = globalThis.location.href;
            render(preview({ target: { module: 'sales', feature: 'customers' } }));
            fireEvent.click(within(trail()).getByText('Sales'));
        });

        it('should go back to the first feature of the module', () => page()!.should.equal('sales.orders'));
        it('should follow with the sidebar', () => current(sidebar()).should.deep.equal(['Orders']));
        it('should not write the address of the page that hosts the preview', () => globalThis.location.href.should.equal(before));
    });

    describe('and the navigation mode selects', () => {
        let activations: NavigationActivation[];
        beforeEach(() => {
            activations = [];
            render(preview({ navigationMode: 'select', onActivate: activation => activations.push(activation) }));
            fireEvent.click(within(sidebar()).getByText('Customers'));
        });

        it('should not navigate', () => page()!.should.equal('sales.orders'));
        it('should report the item that was activated', () => activations.map(activation => [activation.request.id, activation.mode, activation.navigated]).should.deep.equal([['customers', 'select', false]]));
        it('should report that its target resolves', () => activations[0].resolves.should.equal(true));
    });

    describe('and an item is clicked with Alt held', () => {
        let activations: NavigationActivation[];
        beforeEach(() => {
            activations = [];
            render(preview({ onActivate: activation => activations.push(activation) }));
            fireEvent.click(within(sidebar()).getByText('Customers'), { altKey: true });
        });

        it('should only select it', () => [page(), activations.map(activation => activation.mode)].should.deep.equal(['sales.orders', ['select']]));
    });

    describe('and the host decides per item', () => {
        beforeEach(() => {
            render(preview({ navigationMode: request => request.id === 'customers' ? 'select' : 'navigate' }));
            fireEvent.click(within(sidebar()).getByText('Customers'));
            fireEvent.click(within(topbar()).getByText('Support'));
        });

        it('should navigate only where it said so', () => page()!.should.equal('support.tickets'));
    });

    describe('and the host asks to be told of navigation', () => {
        let destinations: DestinationReference[];
        beforeEach(() => {
            destinations = [];
            render(preview({ onNavigate: destination => destinations.push(destination) }));
            fireEvent.click(within(sidebar()).getByText('Customers'));
            fireEvent.click(within(topbar()).getByText('Support'));
        });

        it('should be told of each screen the preview moved to', () => destinations.map(destination => destination.screen).should.deep.equal(['sales.customers', 'support.tickets']));
    });

    describe('and the preview starts at a destination', () => {
        it('should start on its screen', () => {
            render(preview({ initialDestination: { screen: 'sales.customers' } }));
            page()!.should.equal('sales.customers');
        });

        it('should report one the document cannot render and start on the target', () => {
            const problems: string[] = [];
            render(preview({ initialDestination: { screen: 'nowhere' }, onProblems: found => problems.push(...found.map(problem => problem.code).filter(code => code === 'navigationInvalid')) }));
            [page(), problems].should.deep.equal(['sales.orders', ['navigationInvalid']]);
        });
    });

    describe('and the application is previewed', () => {
        let before: string;
        beforeEach(() => {
            before = globalThis.location.href;
            render(galleryPreview({ initialDestination: { screen: 'Dashboard' } }));
        });

        it('should show the shell of the blueprint on the destination', () => [page(), document.querySelector('.layout-topbar') !== null].should.deep.equal(['Dashboard', true]));

        describe('and a menu entry is clicked', () => {
            beforeEach(() => { fireEvent.click(within(galleryMenu()).getByText('Products')); });

            it('should render the gallery screen it targets', () => page()!.should.equal('CrudList'));
            it('should make the entry the current one', () => current(galleryMenu()).should.deep.equal(['Products']));
            it('should follow with the authored breadcrumb', () => crumbs().slice(1).should.deep.equal(['Catalog', 'Products']));
            it('should not write the address of the page that hosts the preview', () => globalThis.location.href.should.equal(before));

            describe('and a crumb is clicked', () => {
                beforeEach(() => { fireEvent.click(within(trail()).getByText('Catalog')); });

                it('should go to the screen of the crumb', () => page()!.should.equal('Dashboard'));
            });
        });

        describe('and an entry of the user menu is chosen', () => {
            beforeEach(() => {
                fireEvent.click(screen.getByRole('button', { name: /Open the menu for/ }));
                fireEvent.click(within(screen.getByRole('menu')).getByText('Help'));
            });

            it('should go to its screen', () => page()!.should.equal('Help'));
        });

        describe('and the logo is clicked', () => {
            beforeEach(() => {
                fireEvent.click(within(galleryMenu()).getByText('Users'));
                fireEvent.click(document.querySelector('.layout-topbar .layout-logo')!);
            });

            it('should go to the screen the logo names', () => page()!.should.equal('Dashboard'));
        });
    });

    describe('and every menu entry of the gallery is clicked in turn', () => {
        let before: string;
        beforeEach(() => {
            before = globalThis.location.href;
            render(galleryPreview({ initialDestination: { screen: 'Dashboard' } }));
        });

        for (const entry of navigationEntries) {
            it(`should swap the content slot to ${entry.label} and make it current without writing the address`, () => {
                const link = Array.from(galleryMenu().querySelectorAll<HTMLElement>('.layout-menu-link')).find(candidate => candidate.textContent?.includes(entry.label))!;
                fireEvent.click(link);
                const currentLinks = Array.from(galleryMenu().querySelectorAll('[aria-current="page"]')).map(candidate => candidate.textContent);
                [page(), currentLinks.some(text => text?.includes(entry.label)), globalThis.location.href].should.deep.equal([entry.targetScreen, true, before]);
            });
        }
    });

    describe('and an entry targets a screen the host does not render', () => {
        beforeEach(() => {
            const application = galleryApplication();
            application.screens = application.screens.filter(candidate => candidate.name !== 'Help');
            render(galleryPreview({ document: application, initialDestination: { screen: 'Dashboard' } }));
        });

        it('should draw the entry with the warning marker', () => within(galleryMenu()).getByText('Help').closest('li')!.getAttribute('data-nav-problem')!.should.equal('navTargetMissing'));
        it('should not mark an entry that resolves', () => (within(galleryMenu()).getByText('Users').closest('li')!.getAttribute('data-nav-problem') === null).should.equal(true));

        describe('and it is clicked', () => {
            beforeEach(() => { fireEvent.click(within(galleryMenu()).getByText('Help')); });

            it('should stay where it was', () => page()!.should.equal('Dashboard'));
        });
    });

    describe('and an item of the region has no target', () => {
        it('should draw it with the warning marker and not navigate', () => {
            const model = JSON.parse(JSON.stringify(preview().props.children.props.navigation));
            model.modules[0].regions[0].items.push({ id: 'soon', title: 'Soon' });
            render(preview({ navigation: model }));
            const item = within(sidebar()).getByText('Soon').closest('li')!;
            fireEvent.click(within(sidebar()).getByText('Soon'));
            [item.getAttribute('data-nav-problem'), page()].should.deep.equal(['navTargetMissing', 'sales.orders']);
        });
    });

    describe('and a destination is a dialog', () => {
        it('should open it over the page', () => {
            render(galleryPreview({ initialDestination: { dialog: 'ConfirmDialog' } }));
            screen.getByRole('dialog').getAttribute('data-scene-dialog')!.should.equal('ConfirmDialog');
        });
    });
});
