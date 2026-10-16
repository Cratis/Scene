// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll } from 'vitest';
import { NavigationRegionKind } from '@cratis/scene.model';
import { crmNavigation, crmModule } from '../index';
import { preview, provideBrowserApis } from './given';

const sidebar = () => screen.getByRole('navigation', { name: 'Sidebar' });
const onPage = () => document.querySelector('[data-scene-outlet="primary"]')!.getAttribute('data-scene-screen');
const sidebarItems = crmNavigation.modules[0].regions.find(region => region.region === NavigationRegionKind.Sidebar)!.items;
const topLevel = sidebarItems.filter(item => item.target?.feature !== undefined);

// Spec N1 and N4 for a blueprint: every item of the sidebar swaps the content slot to its feature, becomes the current one and leaves the address alone.
describe('when navigating the CRM application', () => {
    beforeAll(provideBrowserApis);
    afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

    describe('and every item of the sidebar is clicked in turn', () => {
        let before: string;
        beforeEach(() => {
            before = globalThis.location.href;
            render(preview('crm.dashboard'));
        });

        it('should have an item to click', () => topLevel.length.should.be.greaterThan(1));

        for (const item of topLevel) {
            it(`should swap the content slot to ${item.title} and make it current without writing the address`, () => {
                const link = sidebar().querySelector<HTMLElement>(`[data-scene-nav-item="${item.id}"] > a`)!;
                fireEvent.click(link);
                const current = Array.from(sidebar().querySelectorAll('[aria-current="page"]')).map(entry => entry.closest('[data-scene-nav-item]')?.getAttribute('data-scene-nav-item'));
                [onPage(), current.includes(item.id), globalThis.location.href].should.deep.equal([`${crmModule}.${item.target!.feature}`, true, before]);
            });
        }
    });

    describe('and the module in the topbar is clicked after another item', () => {
        it('should return to the first feature of the module', () => {
            render(preview('crm.dashboard'));
            fireEvent.click(sidebar().querySelector<HTMLElement>(`[data-scene-nav-item="${topLevel[topLevel.length - 1].id}"] > a`)!);
            fireEvent.click(screen.getByRole('navigation', { name: 'Modules' }).querySelector('a')!);
            onPage()!.should.equal(`${crmModule}.${topLevel[0].target!.feature}`);
        });
    });
});
