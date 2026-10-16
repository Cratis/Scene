// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll } from 'vitest';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { NavigationRegionKind, NavigationRegionMode, type NavigationModel } from '@cratis/scene.model';
import { ApplicationHost } from '../ApplicationHost';
import { ApplicationDocument } from '../ApplicationDocument';
import { element, navigation, ordersApplication, registry, structure, withPrime } from '../for_ScenePreviewHost/given';

// The layout of the application declares a `side` slot of its own; no screen declares an outlet of that name (Cratis/Stage#456).
const slots = ['topbar', 'sidebar', 'menu', 'breadcrumb', 'content', 'footer', 'side'].map(name => ({ name }));

function application(): ApplicationDocument {
    const document = ordersApplication();
    return {
        ...document,
        layouts: [{ name: 'AppShell', slots }],
        screens: document.screens.map(candidate => candidate.name === 'support.tickets'
            ? { ...candidate, slotContent: { content: [element('tickets', 'test:page', { title: 'Tickets' })] } }
            : candidate),
    };
}

const withSideItem: NavigationModel = {
    ...navigation,
    modules: navigation.modules.map(module => module.module === 'support'
        ? { ...module, regions: module.regions.map(region => region.region === NavigationRegionKind.Sidebar
            ? { ...region, mode: NavigationRegionMode.Override, items: region.items.map(item => item.id === 'kb' ? { ...item, slot: 'side' } : item) }
            : region) }
        : module),
};

const host = (initialScreen = 'support.tickets', document = application()) =>
    withPrime(<ApplicationHost application={document} navigationModel={{ structure: new ApplicationStructureIndex(structure), navigation: withSideItem }} registry={registry} composition={{ logo: navigation.application.logo }} initialScreen={initialScreen} />);

const sidebar = () => screen.getByRole('navigation', { name: 'Sidebar' });
const primary = () => document.querySelector('[data-scene-outlet="primary"]')!;
const side = () => document.querySelector('[data-scene-outlet="side"]');
const active = () => Array.from(sidebar().querySelectorAll('[aria-current="page"]')).map(item => item.textContent?.trim());
const nothing = () => undefined;

describe('when a navigation item renders into a slot the shell declares', () => {
    beforeAll(() => {
        globalThis.ResizeObserver ??= class { observe = nothing; unobserve = nothing; disconnect = nothing; } as unknown as typeof ResizeObserver;
        window.matchMedia ??= (() => ({ matches: false, addEventListener: nothing, removeEventListener: nothing, addListener: nothing, removeListener: nothing })) as unknown as typeof window.matchMedia;
    });

    afterEach(cleanup);

    describe('and nothing was opened in it', () => {
        beforeEach(() => { render(host()); });

        it('should draw the side slot as an empty outlet', () => [side() !== null, side()?.hasAttribute('data-scene-outlet-screen'), side()?.textContent].should.deep.equal([true, false, '']));
        it('should show the page in the primary outlet', () => primary().getAttribute('data-scene-screen')!.should.equal('support.tickets'));
        it('should mark only the page the user is on', () => active().should.deep.equal(['Tickets']));
        it('should draw no close button', () => (screen.queryByRole('button', { name: 'Close' }) === null).should.equal(true));
    });

    describe('and the item is clicked', () => {
        beforeEach(() => {
            render(host());
            fireEvent.click(within(sidebar()).getByText('Knowledge base'));
        });

        it('should keep the page in the primary outlet', () => primary().getAttribute('data-scene-screen')!.should.equal('support.tickets'));
        it('should still show the page', () => primary().textContent!.should.contain('Tickets'));
        it('should render the target in the side pane', () => side()!.textContent!.should.contain('Knowledge base'));
        it('should draw the side pane inside the shell, beside the page', () => (document.querySelector('.layout-wrapper > .layout-side [data-scene-outlet="side"]') !== null).should.equal(true));
        it('should mark both items active', () => active().should.deep.equal(['Tickets', 'Knowledge base']));
        it('should offer to close the pane', () => (within(side() as HTMLElement).queryByRole('button', { name: 'Close' }) !== null).should.equal(true));
    });

    describe('and the pane is closed', () => {
        beforeEach(() => {
            render(host());
            fireEvent.click(within(sidebar()).getByText('Knowledge base'));
            fireEvent.click(within(side() as HTMLElement).getByRole('button', { name: 'Close' }));
        });

        it('should empty the side pane', () => side()!.textContent!.should.not.contain('Knowledge base'));
        it('should keep the page', () => primary().textContent!.should.contain('Tickets'));
        it('should mark only the page again', () => active().should.deep.equal(['Tickets']));
    });

    describe('and another page is opened while the pane is showing', () => {
        beforeEach(() => {
            render(host());
            fireEvent.click(within(sidebar()).getByText('Knowledge base'));
            fireEvent.click(within(screen.getByRole('navigation', { name: 'Modules' })).getByText('Sales'));
        });

        it('should replace the page', () => primary().getAttribute('data-scene-screen')!.should.equal('sales.orders'));
        it('should keep the side pane', () => side()!.textContent!.should.contain('Knowledge base'));
    });

    describe('and the shell has no such slot', () => {
        beforeEach(() => {
            render(host('support.tickets', { ...application(), layouts: [{ name: 'AppShell', slots: slots.filter(slot => slot.name !== 'side') }] }));
            fireEvent.click(within(sidebar()).getByText('Knowledge base'));
        });

        it('should open the target in the primary outlet as before', () => primary().getAttribute('data-scene-screen')!.should.equal('support.kb'));
        it('should draw no side pane', () => (side() === null).should.equal(true));
    });
});
