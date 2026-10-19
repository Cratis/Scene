// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const css = readFileSync(resolve(__dirname, '../layout.css'), 'utf8');
const hidesTheName = (mode: string) => new RegExp(`\\.layout-${mode} \\.layout-logo-name[,\\s{][^{]*\\{[^}]*display:\\s*none`).test(css.replace(/\n/g, ' '));

// A rail has no room beside the mark: the name stays in the top bar instead of spilling over the page (Scene#220).
describe('when a rail mode draws the logo', () => {
    it('should draw the mark only in slim', () => hidesTheName('slim').should.equal(true));
    it('should draw the mark only in slim plus', () => hidesTheName('slim-plus').should.equal(true));
    it('should draw the mark only in compact', () => hidesTheName('compact').should.equal(true));
    it('should clip a name that a sidebar still shows', () => css.should.contain('.layout-sidebar .layout-logo-name'));
});
