// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const stylesheet = readFileSync(fileURLToPath(new URL('../ScreenInspector.css', import.meta.url)), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const ruleFor = (selector: string) => stylesheet.split('}').find(rule => rule.split('{')[0].split(',').map(part => part.trim()).includes(selector)) ?? '';

describe('when the properties panel opens a native list', () => {
    const select = ruleFor('.studio-editor-inspector select');
    const option = ruleFor('.studio-editor-inspector option');

    it('should give the picker a themed background', () => select.should.contain('background-color: var(--cratis-surface-card'));
    it('should give the picker themed text', () => select.should.contain('color: var(--cratis-text-color'));
    it('should give each option a themed background', () => option.should.contain('background-color: var(--cratis-surface-card'));
    it('should give each option themed text', () => option.should.contain('color: var(--cratis-text-color'));
});
