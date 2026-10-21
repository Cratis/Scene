// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { galleryApplication } from '../../preview-host/galleryApplication';

const css = readFileSync(resolve(__dirname, '../layout.css'), 'utf8').replace(/\n/g, ' ');
const rule = (selector: string) => new RegExp(`${selector.replace(/[.\-:()+]/g, '\\$&')}\\s*\\{([^}]*)\\}`).exec(css)?.[1] ?? '';

// @cratis/components ships no font stack, so the shell must not fall back to the browser's serif (Scene#250).
describe('when laying out the default shell', () => {
    it('should read the theme font before the sans stack', () => css.should.contain('font-family: var(--scene-text-font-family, var(--layout-font-stack))'));
    it('should end the sans stack in the generic sans-serif family', () => /--layout-font-stack:[^;]*sans-serif;/.test(css).should.equal(true));
    it('should dock a static sidebar from the top edge so no block is left above it', () => rule('.layout-static:not(.layout-static-inactive) .layout-sidebar').should.contain('inset-block-start: 0'));
    it('should show the brand once by hiding the topbar logo only beside a docked sidebar that has one', () => rule('.layout-static:not(.layout-static-inactive):has(.layout-sidebar .layout-logo) .layout-topbar .layout-logo').should.contain('display: none'));
    it('should leave the avatar initials room by overlapping the circles only slightly', () => rule('.foundation-avatar + .foundation-avatar').should.contain('--foundation-space-1'));
    it('should not repeat the brand name as a sidebar title', () => JSON.stringify(galleryApplication()).should.not.contain('"title":"Contoso"'));
});
