// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const stylesheet = readFileSync(fileURLToPath(new URL('../ScreenEditorPanel.css', import.meta.url)), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const ruleFor = (selector: string) => stylesheet.split('}').find(rule => rule.split('{')[0].split(',').map(part => part.trim()).includes(selector)) ?? '';

describe('when laying out the design area', () => {
    const panel = ruleFor('.studio-screen-editor-panel');
    const toolbar = ruleFor('.studio-screen-editor-panel__toolbar');
    const body = ruleFor('.studio-screen-editor-panel__body');

    it('should stack the toolbar over the surface and the inspector', () => panel.should.contain('flex-direction: column'));
    it('should give the toolbar the whole width', () => toolbar.should.contain('width: 100%'));
    it('should keep the toolbar from shrinking', () => toolbar.should.contain('flex: 0 0 auto'));
    it('should size the inspector drawer from the body, not the toolbar', () => body.should.contain('container-name: studio-screen-editor-panel'));
});
