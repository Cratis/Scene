// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    LayoutMode,
    defaultLayoutConfigState,
    isPointerRevealMode,
    toggleSidebarAnchor,
    withMode,
    withSidebarRevealed,
} from '../configuration';

describe('when anchoring a reveal sidebar', () => {
    const reveal = withMode(defaultLayoutConfigState(), LayoutMode.Reveal);
    const anchored = toggleSidebarAnchor(reveal);

    it('should recognize reveal and drawer as the pointer-driven modes', () => {
        isPointerRevealMode(LayoutMode.Reveal).should.be.true;
        isPointerRevealMode(LayoutMode.Drawer).should.be.true;
        isPointerRevealMode(LayoutMode.Static).should.be.false;
    });

    it('should hold the sidebar out as soon as it is anchored', () => {
        anchored.isSidebarRevealed.should.be.true;
    });

    it('should ignore the pointer while anchored', () => {
        withSidebarRevealed(anchored, false).should.equal(anchored);
    });

    it('should let the pointer take over again once unanchored', () => {
        const unanchored = toggleSidebarAnchor(anchored);
        unanchored.isSidebarAnchored.should.be.false;
        withSidebarRevealed(unanchored, true).isSidebarRevealed.should.be.true;
    });

    it('should keep the pin across a mode change, since it is a preference rather than transient state', () => {
        withMode(anchored, LayoutMode.Drawer).isSidebarAnchored.should.be.true;
    });

    it('should drop a pointer-held reveal when the mode changes', () => {
        withMode(withSidebarRevealed(reveal, true), LayoutMode.Static).isSidebarRevealed.should.be.false;
    });
});
