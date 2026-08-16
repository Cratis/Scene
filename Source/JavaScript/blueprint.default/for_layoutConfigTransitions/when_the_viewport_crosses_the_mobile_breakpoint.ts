// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    LayoutMode,
    defaultLayoutConfigState,
    effectiveLayoutMode,
    isMobileWidth,
    layoutModes,
    layoutWrapperClasses,
    mobileBreakpoint,
    toggleSidebar,
    withMobile,
    withMode,
} from '../configuration';

describe('when the viewport crosses the mobile breakpoint', () => {
    const desktop = withMode(defaultLayoutConfigState(), LayoutMode.Slim);
    const mobile = withMobile(desktop, true);
    const backToDesktop = withMobile(mobile, false);

    it('should treat the breakpoint itself as mobile, matching the stylesheet', () => {
        isMobileWidth(mobileBreakpoint).should.be.true;
        isMobileWidth(mobileBreakpoint + 1).should.be.false;
    });

    it('should force every mode off-canvas below the breakpoint', () => {
        for (const mode of layoutModes) {
            effectiveLayoutMode(withMobile(withMode(desktop, mode), true)).should.equal(LayoutMode.Overlay);
        }
    });

    it('should keep the chosen mode rather than overwriting it', () => {
        mobile.mode.should.equal(LayoutMode.Slim);
    });

    it('should close the sidebar on the way in so the page is not covered on arrival', () => {
        mobile.isSidebarOpen.should.be.false;
    });

    it('should mark the wrapper mobile', () => {
        layoutWrapperClasses(mobile).should.contain('layout-mobile');
    });

    it('should mark the wrapper mobile-active once the sidebar is opened', () => {
        layoutWrapperClasses(toggleSidebar(mobile)).should.contain('layout-mobile-active');
    });

    it('should restore the chosen mode on the way back out', () => {
        effectiveLayoutMode(backToDesktop).should.equal(LayoutMode.Slim);
    });

    it('should leave the state untouched when the regime has not actually changed', () => {
        withMobile(mobile, true).should.equal(mobile);
    });

    it('should reopen a static sidebar on the way back out, since docked is its resting state', () => {
        const staticMobile = withMobile(withMode(defaultLayoutConfigState(), LayoutMode.Static), true);
        withMobile(staticMobile, false).isSidebarOpen.should.be.true;
    });
});
