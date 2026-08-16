// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { JSDOM } from 'jsdom';
import { Theme } from '@cratis/scene.model';
import { applyThemeTokens } from '../index';

const light: Theme = {
    name: 'Daylight',
    compatibleWith: ['core'],
    tokens: { 'primary.color': '#2563eb', 'surface.background': '#ffffff' },
};

const dark: Theme = {
    name: 'Midnight',
    compatibleWith: ['core'],
    isDark: true,
    tokens: { 'primary.color': '#60a5fa' },
};

describe('when switching themes', () => {
    const dom = new JSDOM('<div id="root"></div>');
    const element = dom.window.document.getElementById('root') as unknown as HTMLElement;

    applyThemeTokens(element, light);
    const afterLight = {
        primary: element.style.getPropertyValue('--scene-primary-color'),
        surface: element.style.getPropertyValue('--scene-surface-background'),
        theme: element.getAttribute('data-scene-theme'),
        scheme: element.getAttribute('data-scene-color-scheme'),
    };

    applyThemeTokens(element, dark, light);
    const afterDark = {
        primary: element.style.getPropertyValue('--scene-primary-color'),
        surface: element.style.getPropertyValue('--scene-surface-background'),
        theme: element.getAttribute('data-scene-theme'),
        scheme: element.getAttribute('data-scene-color-scheme'),
    };

    applyThemeTokens(element, undefined, dark);
    const afterClearing = {
        primary: element.style.getPropertyValue('--scene-primary-color'),
        theme: element.getAttribute('data-scene-theme'),
    };

    it('should write the first theme tokens as custom properties', () => {
        afterLight.primary.should.equal('#2563eb');
        afterLight.surface.should.equal('#ffffff');
    });

    it('should mark the element with the first theme name and scheme', () => {
        afterLight.theme!.should.equal('Daylight');
        afterLight.scheme!.should.equal('light');
    });

    it('should overwrite a token the next theme also defines', () => {
        afterDark.primary.should.equal('#60a5fa');
    });

    it('should remove a token the next theme does not define, rather than leaving it stale', () => {
        afterDark.surface.should.equal('');
    });

    it('should mark the element as dark for a dark theme', () => {
        afterDark.theme!.should.equal('Midnight');
        afterDark.scheme!.should.equal('dark');
    });

    it('should clear every token and marker when the theme is removed', () => {
        afterClearing.primary.should.equal('');
        (afterClearing.theme === null).should.be.true;
    });
});
