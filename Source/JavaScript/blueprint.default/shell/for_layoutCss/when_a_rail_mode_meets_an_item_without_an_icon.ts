// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const css = readFileSync(resolve(__dirname, '../layout.css'), 'utf8').replace(/\n/g, ' ');
const keepsTheLabel = (mode: string) => new RegExp(`\\.layout-${mode} \\.layout-menu-item\\[data-scene-iconless\\] > \\.layout-menu-link \\.layout-menu-label[,\\s{][^{]*\\{[^}]*display:\\s*block`).test(css);

// A rail is made of icons; an entry without one must not become an empty square (Scene#230).
describe('when a rail mode meets an item without an icon', () => {
    it('should keep its label in slim', () => keepsTheLabel('slim').should.equal(true));
    it('should keep its label in compact', () => keepsTheLabel('compact').should.equal(true));
});
