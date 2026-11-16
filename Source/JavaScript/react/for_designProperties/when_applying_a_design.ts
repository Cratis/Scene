// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { JSDOM } from 'jsdom';
import { ColorScheme, DesignSystem } from '@cratis/scene.model';
import { ResolvedDesign, resolveDesign } from '@cratis/scene.engine';
import { applyDesign, designCustomProperties, designStyleSheet } from '../index';

const designSystem: DesignSystem = {
    name: 'Shop',
    modes: ['light', 'dark'],
    tokens: [{ category: 'color', name: 'primary' }, { category: 'color', name: 'on-primary' }],
    components: [{
        name: 'Button',
        parts: ['background', 'text'],
        variants: [{ name: 'primary', parts: { background: 'color.primary', text: 'color.on-primary' }, states: { hover: { background: 'color.on-primary' } } }],
    }],
    themes: [{
        name: 'Plain',
        isDefault: true,
        modes: [
            { mode: 'light', tokens: { 'color.primary': '#2563eb', 'color.on-primary': '#ffffff' } },
            { mode: 'dark', tokens: { 'color.primary': '#60a5fa', 'color.on-primary': '#000000' } },
        ],
    }],
};

const design = (scheme: ColorScheme): ResolvedDesign => resolveDesign({ designSystem, appearance: { colorScheme: scheme } });

describe('when applying a design', () => {
    const dom = new JSDOM('<div id="root"></div>');
    const element = dom.window.document.getElementById('root') as unknown as HTMLElement;
    const light = design(ColorScheme.Light);
    const dark = design(ColorScheme.Dark);
    const read = (property: string) => element.style.getPropertyValue(property);

    applyDesign(element, light);
    const afterLight = { token: read('--ds-token-color-primary'), anatomy: read('--ds-button-primary-background'), state: read('--ds-button-primary-background-hover'), theme: element.getAttribute('data-scene-theme'), mode: element.getAttribute('data-scene-mode'), scheme: element.getAttribute('data-scene-color-scheme') };
    applyDesign(element, dark, light);
    const afterDark = { token: read('--ds-token-color-primary'), anatomy: read('--ds-button-primary-background'), mode: element.getAttribute('data-scene-mode'), scheme: element.getAttribute('data-scene-color-scheme') };
    applyDesign(element, undefined, dark);
    const afterClearing = { anatomy: read('--ds-button-primary-background'), token: read('--ds-token-color-primary'), theme: element.getAttribute('data-scene-theme') };

    it('should write every token role as a custom property', () => afterLight.token.should.equal('#2563eb'));
    it('should write every part of a variant as a custom property', () => afterLight.anatomy.should.equal('#2563eb'));
    it('should write every part of a state as a custom property', () => afterLight.state.should.equal('#ffffff'));
    it('should mark the element with the theme, the mode and the scheme', () => [afterLight.theme, afterLight.mode, afterLight.scheme].should.deep.equal(['Plain', 'light', 'light']));
    it('should overwrite what the next mode also defines', () => [afterDark.token, afterDark.anatomy].should.deep.equal(['#60a5fa', '#60a5fa']));
    it('should move the markers to the next mode', () => [afterDark.mode, afterDark.scheme].should.deep.equal(['dark', 'dark']));
    it('should remove everything when the design is cleared', () => [afterClearing.anatomy, afterClearing.token, afterClearing.theme].should.deep.equal(['', '', null]));

    describe('and the properties are listed', () => {
        const properties = designCustomProperties(dark);

        it('should list roles and anatomy together', () => Object.keys(properties).sort().should.deep.equal([
            '--ds-button-primary-background', '--ds-button-primary-background-hover', '--ds-button-primary-text', '--ds-button-primary-text-hover',
            '--ds-token-color-on-primary', '--ds-token-color-primary',
        ]));
        it('should give a state the whole look of the variant with its own overrides', () => [properties['--ds-button-primary-background-hover'], properties['--ds-button-primary-text-hover']].should.deep.equal(['#000000', '#000000']));
    });

    describe('and a style sheet is written for every mode', () => {
        const sheet = designStyleSheet([light, dark], '.app');

        it('should scope each mode by its attribute', () => [sheet.includes(".app[data-scene-mode='light'] {"), sheet.includes(".app[data-scene-mode='dark'] {")].should.deep.equal([true, true]));
        it('should carry the values of the mode', () => [sheet.includes('--ds-token-color-primary: #2563eb;'), sheet.includes('--ds-token-color-primary: #60a5fa;')].should.deep.equal([true, true]));
    });
});
