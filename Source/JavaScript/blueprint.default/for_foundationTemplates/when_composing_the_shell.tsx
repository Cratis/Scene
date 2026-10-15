// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, within } from '@testing-library/react';
import { PrimeReactProvider } from '@primereact/core';
import { afterEach, beforeAll } from 'vitest';
import { corePackage, mergePackageRegistries } from '@cratis/scene.react';
import { defaultBlueprint } from '../defaultBlueprint';
import { LayoutMode } from '../configuration';
import { GalleryScreenPreview } from '../gallery';
import { appShellLayout, SlotName } from '../layouts';
import { violationsIn } from '../for_foundation/given';
import { provideBrowserApis } from '../for_templatePreviewStates/given';
import { foundationPack, foundationTemplateNames } from './given';

const registry = mergePackageRegistries([corePackage, defaultBlueprint]);
const preview = (name: string, mode?: LayoutMode) =>
    render(<PrimeReactProvider><GalleryScreenPreview screenName={name} registry={registry} pack={foundationPack} initialConfig={mode ? { mode } : undefined} /></PrimeReactProvider>);

// Part B 2.1, the AppShell: topbar = logo/name, global search, notifications, user menu, environment badge; the sidebar is the navigation; variants are
// sidebar-left (the default), top-navigation-only (horizontal) and a right utility panel. Every screen template fits it without any shell code of its own.
describe('when composing the shell around a foundation template', () => {
    beforeAll(provideBrowserApis);
    afterEach(cleanup);

    it('should declare the slots of Part B 2.1 and the right panel the utility variant uses', () => {
        const slots = appShellLayout.slots.map(slot => slot.name);
        [SlotName.Topbar, SlotName.Sidebar, SlotName.Content, SlotName.Footer, SlotName.RightPanel].filter(name => !slots.includes(name)).should.deep.equal([]);
    });

    it('should draw the topbar with the logo, search, notifications, the environment and the user', () => {
        const { container } = preview('ListScreen');
        const topbar = container.querySelector('.layout-topbar') as HTMLElement;
        (topbar.querySelector('[role="search"]') === null).should.equal(false);
        within(topbar).getByRole('button', { name: /Notifications: 3 unread/ });
        topbar.textContent!.should.contain('Production');
        topbar.textContent!.should.contain('Amelia Nyquist');
        (topbar.querySelector('.layout-logo, [class*="logo"]') === null).should.equal(false);
    });

    it('should draw the sidebar as the navigation, with the current screen marked', () => {
        const { container } = preview('DashboardScreen');
        (container.querySelector('nav, .layout-sidebar') === null).should.equal(false);
    });

    for (const mode of [LayoutMode.Static, LayoutMode.Horizontal, LayoutMode.Drawer]) {
        it(`should place every foundation template in the shell in ${mode} mode without any code of its own`, async () => {
            for (const name of foundationTemplateNames) {
                const { container } = preview(name, mode);
                container.textContent!.should.not.contain('Unresolved');
                (container.querySelector('.layout-content, main') === null).should.equal(false);
                cleanup();
            }
        });

        it(`should leave the shell in ${mode} mode without an accessibility violation`, async () => {
            const { container } = preview('ListScreen', mode);
            (await violationsIn(container)).should.deep.equal([]);
        });
    }

    it('should keep the notifications count from the pack, and say none in words without one', () => {
        const withPack = preview('ListScreen');
        within(withPack.container).getByRole('button', { name: /3 unread/ });
        cleanup();
        const without = render(<PrimeReactProvider><GalleryScreenPreview screenName='ListScreen' registry={registry} /></PrimeReactProvider>);
        within(without.container).getByRole('button', { name: /No new notifications/ });
    });
});
