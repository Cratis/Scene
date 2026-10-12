// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(__dirname, '../shell/layout.css'), 'utf8');

// The block of the first narrow-window rule set, up to the closing brace that ends the media query.
const narrow = css.slice(css.indexOf('@media (max-width: 991px)'));
const media = narrow.slice(0, narrow.indexOf('\n}\n'));

describe('when opening the menu on a narrow window', () => {
    it('should park the sidebar off-canvas on a narrow window', () => {
        media.should.contain('.layout-wrapper .layout-sidebar {');
        media.should.match(/\.layout-wrapper \.layout-sidebar \{[^}]*transform: translateX\(-100%\)/);
    });

    it('should bring the sidebar back with a rule that out-ranks the parked one', () => {
        // `.layout-wrapper .layout-sidebar` and `.layout-mobile-active .layout-sidebar` have the same specificity and the
        // narrow-window rule comes later, so the open state needs the wrapper's class too or the toggle opens nothing.
        media.should.match(/\.layout-wrapper\.layout-mobile-active \.layout-sidebar \{[^}]*transform: translateX\(0\)/);
        media.indexOf('.layout-wrapper.layout-mobile-active .layout-sidebar').should.be.greaterThan(media.indexOf('.layout-wrapper .layout-sidebar {'));
    });
});
