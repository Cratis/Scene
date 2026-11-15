// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CascadePanel } from '../CascadePanel';
import { CascadeEntryKind } from '../CascadeEntryKind';

/**
 * ARIA forbids a text field inside a `menu` (axe `aria-required-children`), so the filter sits beside the menu in the panel
 * and points at it (Cratis/StudioIssues#738).
 */
describe('when a panel has a filter', () => {
    let markup: string;

    beforeEach(() => {
        markup = renderToStaticMarkup(React.createElement(CascadePanel, {
            entries: [{ kind: CascadeEntryKind.Item, id: 'one', label: 'One', onActivate: () => { /* no-op */ } }],
            depth: 0,
            anchor: { top: 0, left: 0, width: 10, height: 10 },
            openPath: [],
            label: 'Choose',
            filter: { placeholder: 'Filter...', value: '', onChange: () => { /* no-op */ } },
            onOpen: () => { /* no-op */ },
            onCollapse: () => { /* no-op */ },
            onChosen: () => { /* no-op */ },
        }));
    });

    it('should keep the filter outside the menu', () => {
        const menuStart = markup.indexOf('role="menu"');
        const filterStart = markup.indexOf('role="searchbox"');
        (filterStart >= 0 && menuStart >= 0 && filterStart < markup.lastIndexOf('<div', menuStart)).should.be.true;
    });

    it('should point the filter at the menu', () => {
        const controls = /aria-controls="([^"]+)"/.exec(markup)?.[1];
        (controls !== undefined && markup.includes(`id="${controls}"`)).should.be.true;
    });

    it('should name the menu', () => markup.should.match(/<div[^>]*role="menu"[^>]*aria-label="Choose"|<div[^>]*aria-label="Choose"[^>]*role="menu"/));
});
