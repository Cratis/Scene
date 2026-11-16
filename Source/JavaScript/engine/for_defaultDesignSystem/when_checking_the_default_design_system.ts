// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultAppearanceBindings, defaultDesignSystem, tokenAddress } from '../index';

const parts = ['text', 'background', 'border', 'radius', 'height', 'padding', 'shadow', 'font'];
const categories = ['color', 'space', 'size', 'radius', 'border', 'shadow', 'font', 'type', 'motion', 'opacity', 'z'];
const roles = defaultDesignSystem.tokens.map(tokenAddress);

describe('when checking the default design system', () => {
    it('should declare the twenty-one tokens every package used to style from, and the font', () => roles.should.have.lengthOf(22));
    it('should name every role once', () => new Set(roles).size.should.equal(roles.length));
    it('should use only the categories of the closed list', () => defaultDesignSystem.tokens.filter(role => !categories.includes(role.category)).should.deep.equal([]));
    it('should describe what every role is for', () => defaultDesignSystem.tokens.filter(role => !role.description).should.deep.equal([]));
    it('should be drawn in a light and a dark mode', () => defaultDesignSystem.modes.should.deep.equal(['light', 'dark']));

    describe('and the components', () => {
        const components = defaultDesignSystem.components;

        it('should include the shell and the foundation', () =>
            components.map(component => component.name).should.include.members(['Shell', 'Page', 'Topbar', 'Sidebar', 'Menu', 'Popover', 'Footer', 'Text', 'Card', 'Button', 'Input', 'StatusChip']));
        it('should use only the parts of the closed list', () => components.flatMap(component => component.parts).filter(part => !parts.includes(part)).should.deep.equal([]));
        it('should give every variant only parts its component declares', () =>
            components.flatMap(component => component.variants.flatMap(variant => [...Object.keys(variant.parts), ...Object.values(variant.states ?? {}).flatMap(Object.keys)]
                .filter(part => !component.parts.includes(part)).map(part => `${component.name}.${variant.name}.${part}`))).should.deep.equal([]));
        it('should refer only to roles it declares', () =>
            components.flatMap(component => component.variants.flatMap(variant => [...Object.values(variant.parts), ...Object.values(variant.states ?? {}).flatMap(Object.values)]
                .filter(role => !roles.includes(role)).map(role => `${component.name}.${variant.name}: ${role}`))).should.deep.equal([]));
    });

    it('should bind the appearance to roles it declares', () =>
        Object.values(defaultDesignSystem.appearance!).every(role => roles.includes(role)).should.be.true);
    it('should bind the appearance as the engine does by default', () => defaultDesignSystem.appearance!.should.deep.equal(defaultAppearanceBindings));
    it('should ask for the contrast of text on its background', () => defaultDesignSystem.contrastRules!.should.deep.equal([{ foreground: 'text', background: 'background', minimumRatio: 4.5 }]));
    it('should carry no theme of its own: a theme brings the values', () => defaultDesignSystem.themes.should.deep.equal([]));
});
