// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createRef } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach } from 'vitest';
import { CornerStyle, LogoKind, UiProfile } from '@cratis/scene.model';
import { ProfileRegion, resolveProfileIdentity } from '@cratis/scene.engine';
import { galleryApplication, galleryCompositionFor } from '../galleryApplication';
import { PreviewRegionHandle } from '../previewRegions';
import { ordersApplication } from './given';
import { preview } from './when_previewing_a_module';

const nothing = () => undefined;
const sidebar = () => screen.getByRole('navigation', { name: 'Sidebar' });
const host = () => document.querySelector<HTMLElement>('.scene-preview-host')!;
const wrapper = () => document.querySelector<HTMLElement>('.layout-wrapper')!;

/** The orders application with the profile edited the way a designer edits it. */
function designed(edit: Partial<UiProfile>) {
    const application = ordersApplication();
    application.uiProfiles = [{ ...application.uiProfiles![0], ...edit }];
    return application;
}

describe('when designing the preview', () => {
    beforeAll(() => {
        globalThis.ResizeObserver ??= class { observe = nothing; unobserve = nothing; disconnect = nothing; } as unknown as typeof ResizeObserver;
        window.matchMedia ??= (() => ({ matches: false, addEventListener: nothing, removeEventListener: nothing, addListener: nothing, removeListener: nothing })) as unknown as typeof window.matchMedia;
    });

    afterEach(cleanup);

    describe('and the shell is drawn', () => {
        beforeEach(() => render(preview({ onRegionHover: nothing })));

        it('should mark the top bar as the shell region', () => document.querySelector('.layout-topbar')!.getAttribute('data-scene-region')!.should.equal('shell'));
        it('should mark the sidebar as the menu region', () => document.querySelector('.layout-sidebar')!.getAttribute('data-scene-region')!.should.equal('menu'));
        it('should mark the content as the content region', () => document.querySelector('.layout-content')!.getAttribute('data-scene-region')!.should.equal('content'));
        it('should mark the logo as the identity region', () => document.querySelector('.layout-logo')!.getAttribute('data-scene-region')!.should.equal('identity'));
        it('should never make the hamburger a region of its own', () => document.querySelector('.layout-topbar button')!.hasAttribute('data-scene-region').should.equal(false));
    });

    describe('and the pointer moves over the regions', () => {
        let hovered: (ProfileRegion | null)[];
        beforeEach(() => {
            hovered = [];
            render(preview({ onRegionHover: region => hovered.push(region) }));
            fireEvent.mouseOver(within(sidebar()).getByText('Customers'));
            fireEvent.mouseOver(within(sidebar()).getByText('Orders'));
            fireEvent.mouseOver(document.querySelector('.layout-logo')!);
            fireEvent.mouseLeave(host());
        });

        it('should report each region once, then none when the pointer leaves', () => hovered.should.deep.equal([ProfileRegion.Menu, ProfileRegion.Identity, null]));
    });

    describe('and a navigation item is clicked', () => {
        let activated: ProfileRegion[];
        beforeEach(() => {
            activated = [];
            render(preview({ onRegionActivate: region => activated.push(region) }));
            fireEvent.click(within(sidebar()).getByText('Customers'));
        });

        it('should report the menu region', () => activated.should.deep.equal([ProfileRegion.Menu]));
        it('should still navigate', () => document.querySelector('[data-page="customers"]')!.textContent!.should.contain('Customers'));
    });

    describe('and a navigation item is clicked in select mode', () => {
        let activated: ProfileRegion[];
        beforeEach(() => {
            activated = [];
            render(preview({ navigationMode: 'select' as never, onRegionActivate: region => activated.push(region) }));
            fireEvent.click(within(sidebar()).getByText('Customers'));
        });

        it('should report the menu region', () => activated.should.deep.equal([ProfileRegion.Menu]));
        it('should not navigate', () => document.querySelector('[data-page="orders"]')!.textContent!.should.contain('Orders'));
    });

    describe('and a region has the focus', () => {
        let activated: ProfileRegion[];
        beforeEach(() => {
            activated = [];
            render(preview({ onRegionActivate: region => activated.push(region) }));
            fireEvent.keyDown(document.querySelector('.layout-sidebar')!, { key: 'Enter' });
        });

        it('should make every drawn region one tab stop', () => {
            const drawn = Array.from(document.querySelectorAll('[data-scene-region]')).map(element => element.getAttribute('tabindex'));
            new Set(drawn).should.deep.equal(new Set(['-1']));
        });

        it('should select the region on Enter', () => activated.should.deep.equal([ProfileRegion.Menu]));
    });

    describe('and a region is measured', () => {
        const handle = createRef<PreviewRegionHandle>();
        const box = (left: number, top: number, width: number, height: number) => () => ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: nothing }) as DOMRect;
        beforeEach(() => {
            render(preview({ regions: handle }));
            // The host is shown at half size: 640 pixels of layout drawn into 320 on the screen, starting at (100, 50).
            Object.defineProperty(host(), 'offsetWidth', { configurable: true, value: 640 });
            host().getBoundingClientRect = box(100, 50, 320, 200);
            document.querySelector<HTMLElement>('.layout-sidebar')!.getBoundingClientRect = box(100, 90, 60, 100);
            document.querySelector<HTMLElement>('.layout-topbar')!.getBoundingClientRect = box(0, 0, 0, 0);
        });

        it('should give the box in the preview\'s own pixels, whatever the scale', () => handle.current!.regionRect(ProfileRegion.Menu)!.should.deep.equal({ x: 0, y: 80, width: 120, height: 200 }));
        it('should give no box for a region that is not drawn', () => (handle.current!.regionRect(ProfileRegion.Shell) === undefined).should.equal(true));
    });

    describe('and the profile chooses a menu mode and a menu theme', () => {
        beforeEach(() => render(preview({ document: designed({ root: { template: { source: 'Own' as never, id: 'AppShell' }, options: { navigationMode: 'slimPlus', menuTheme: 'primary' } } }) })));

        it('should lay the shell out in that mode', () => wrapper().className.should.contain('layout-slim-plus'));
        it('should theme the menu', () => wrapper().className.should.contain('layout-menu-primary'));
    });

    describe('and the preview is the width of a phone', () => {
        beforeEach(() => render(preview({ viewportWidth: 390, document: designed({ root: { template: { source: 'Own' as never, id: 'AppShell' }, options: { navigationMode: 'reveal' } } }) })));

        it('should show a drawer whatever the mode', () => wrapper().className.should.contain('layout-drawer'));
        it('should be the mobile regime', () => wrapper().className.should.contain('layout-mobile'));
    });

    describe('and the profile has an identity', () => {
        beforeEach(() => render(preview({ document: designed({ identity: { name: 'Fjord Books', logo: { kind: LogoKind.Initials, initials: 'FB' }, showName: true } }) })));

        it('should draw the name', () => document.querySelector('.layout-logo')!.textContent!.should.contain('Fjord Books'));
        it('should draw the initials as the mark', () => document.querySelector('.layout-logo-mark')!.textContent!.should.equal('FB'));
    });

    describe('and the identity hides the name and uses an icon', () => {
        beforeEach(() => render(preview({ document: designed({ identity: { name: 'Fjord Books', logo: { kind: LogoKind.Icon, icon: 'database' }, showName: false } }) })));

        it('should draw the mark only', () => (document.querySelector('.layout-logo-name') === null).should.equal(true));
        it('should draw the icon', () => document.querySelector('.layout-logo-mark i')!.className.should.contain('pi-database'));
        it('should keep the name for assistive technology', () => document.querySelector('.layout-logo')!.getAttribute('aria-label')!.should.equal('Fjord Books'));
    });

    describe('and the appearance chooses corners and an accent', () => {
        beforeEach(() => render(preview({ document: designed({ appearance: { corners: CornerStyle.Round, accent: '#0a7a4b', font: 'inter' } }) })));

        it('should set the corner radius token', () => host().style.getPropertyValue('--scene-content-border-radius').should.equal('18px'));
        it('should set the accent token', () => host().style.getPropertyValue('--scene-primary-color').should.equal('#0a7a4b'));
        it('should set the font token', () => host().style.getPropertyValue('--scene-text-font-family').should.contain('Inter'));
    });
});

describe('when the gallery application is composed with the identity of the profile', () => {
    beforeAll(() => {
        globalThis.ResizeObserver ??= class { observe = nothing; unobserve = nothing; disconnect = nothing; } as unknown as typeof ResizeObserver;
        window.matchMedia ??= (() => ({ matches: false, addEventListener: nothing, removeEventListener: nothing, addListener: nothing, removeListener: nothing })) as unknown as typeof window.matchMedia;
    });

    afterEach(cleanup);

    const identity = resolveProfileIdentity({ name: 'Fjord', targetPlatform: 'web', packages: [], identity: { name: 'Fjord Books', logo: { kind: LogoKind.Icon, icon: 'database' }, showName: true } }, 'Fjord');
    const drawn = () => preview({ document: galleryApplication(), composition: galleryCompositionFor(identity), target: { application: 'Gallery' } });

    describe('and the shell is drawn', () => {
        beforeEach(() => render(drawn()));

        it('should draw the name of the application in the sidebar and the top bar, not the gallery\'s', () => document.querySelector('.layout-logo')!.textContent!.should.contain('Fjord Books'));
        it('should draw the icon the profile chose', () => document.querySelector('.layout-logo-mark i')!.className.should.contain('pi-database'));
        it('should not leave the gallery\'s brand anywhere', () => document.body.textContent!.should.not.contain('Contoso'));
    });
});
