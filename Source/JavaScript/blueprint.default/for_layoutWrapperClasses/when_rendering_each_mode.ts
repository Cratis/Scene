// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    LayoutMode,
    defaultLayoutConfigState,
    isLayoutMaskVisible,
    layoutModes,
    layoutWrapperClasses,
    toggleSidebar,
    withMobile,
    withMode,
    withSidebarAnchored,
    withSidebarRevealed,
} from '../configuration';

describe('when rendering each mode', () => {
    const started = defaultLayoutConfigState();

    it('should always start with the wrapper class', () => {
        layoutWrapperClasses(started)[0].should.equal('layout-wrapper');
    });

    for (const mode of layoutModes) {
        it(`should put the '${mode}' mode class on the wrapper`, () => {
            layoutWrapperClasses(withMode(started, mode)).should.contain(`layout-${mode}`);
        });
    }

    it('should mark a closed static sidebar inactive', () => {
        layoutWrapperClasses(toggleSidebar(withMode(started, LayoutMode.Static))).should.contain('layout-static-inactive');
    });

    it('should not mark an open static sidebar inactive', () => {
        layoutWrapperClasses(withMode(started, LayoutMode.Static)).should.not.contain('layout-static-inactive');
    });

    it('should mark an opened overlay sidebar active', () => {
        layoutWrapperClasses(toggleSidebar(withMode(started, LayoutMode.Overlay))).should.contain('layout-overlay-active');
    });

    it('should mark a revealed sidebar active', () => {
        layoutWrapperClasses(withSidebarRevealed(withMode(started, LayoutMode.Reveal), true)).should.contain('layout-sidebar-active');
    });

    it('should mark an anchored sidebar anchored', () => {
        layoutWrapperClasses(withSidebarAnchored(withMode(started, LayoutMode.Drawer), true)).should.contain('layout-sidebar-anchored');
    });

    it('should not mark a static sidebar anchored, since only reveal and drawer answer to the pointer', () => {
        layoutWrapperClasses(withSidebarAnchored(withMode(started, LayoutMode.Static), true)).should.not.contain('layout-sidebar-anchored');
    });

    it('should show the mask only while a floating sidebar is open', () => {
        isLayoutMaskVisible(toggleSidebar(withMode(started, LayoutMode.Overlay))).should.be.true;
        isLayoutMaskVisible(withMode(started, LayoutMode.Overlay)).should.be.false;
        isLayoutMaskVisible(withMode(started, LayoutMode.Static)).should.be.false;
    });

    it('should show the mask on mobile once the sidebar is opened, whatever the chosen mode', () => {
        isLayoutMaskVisible(toggleSidebar(withMobile(withMode(started, LayoutMode.Horizontal), true))).should.be.true;
    });
});
