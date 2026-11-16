// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignSystem } from '@cratis/scene.model';
import { sampleDesignSystem } from '../../Testing/sampleDesignSystem';
import {
    categoriesOf,
    completeDesignSystem,
    defaultThemeOf,
    foundationOf,
    partsInState,
    resolvedComponentsIn,
    resolvedVariantIn,
    roleValueIn,
    shownMode,
    shownTheme,
    statesOfComponent,
    statesOfVariant,
    tokensForPart,
    tokensOf,
    valueIn,
    variantOf,
} from '../designResolution';

describe('when reading the design', () => {
    const design: DesignSystem = sampleDesignSystem();
    const menu = design.components.find(component => component.name === 'Menu')!;
    const button = design.components.find(component => component.name === 'Button')!;

    it('should put a color on the color foundation', () => foundationOf('color')!.should.equal('color'));
    it('should put a font on the type foundation', () => foundationOf('font')!.should.equal('type'));
    it('should put a radius on the spacing foundation', () => foundationOf('radius')!.should.equal('spacing'));
    it('should put a shadow on the elevation foundation', () => foundationOf('shadow')!.should.equal('elevation'));
    it('should put no foundation on a category it does not know', () => (foundationOf('flavor') === undefined).should.be.true);
    it('should start a foundation in its first category', () => categoriesOf('spacing')[0].should.equal('space'));

    it('should list the tokens of a foundation in declaration order', () =>
        tokensOf(design, 'color').map(role => role.name).slice(0, 3).should.deep.equal(['primary', 'on-primary', 'background']));
    it('should keep the roles of other foundations out', () => tokensOf(design, 'elevation').map(role => role.name).should.deep.equal(['focus-ring']));

    it('should find the default theme', () => defaultThemeOf(design).should.equal('Acme'));
    it('should show the theme asked for when there is one', () => shownTheme(design, 'Brand').should.equal('Brand'));
    it('should show the default theme for one that does not exist', () => shownTheme(design, 'Nope').should.equal('Acme'));
    it('should show the default theme when none is asked for', () => shownTheme(design).should.equal('Acme'));
    it('should show the mode asked for when there is one', () => shownMode(design, 'dark').should.equal('dark'));
    it('should show the first mode for one that does not exist', () => shownMode(design, 'sepia').should.equal('light'));

    it('should read what a theme makes of a token in a mode', () => valueIn(design, 'Acme', 'dark', 'color.background').should.equal('#0b1220'));
    it('should read it for a token role', () => roleValueIn(design, 'Acme', 'light', design.tokens[0]).should.equal('#1d4ed8'));
    it('should read nothing for a token the theme gives no value', () => valueIn(design, 'Acme', 'light', 'color.nope').should.equal(''));
    it('should read nothing for a theme that is not there', () => valueIn(design, 'Nope', 'light', 'color.primary').should.equal(''));

    it('should evaluate the anatomy against the theme when the theme carries no resolution', () =>
        resolvedComponentsIn(design, 'Acme', 'light').find(component => component.name === 'Button')!.variants[0].parts.background.should.equal('#1d4ed8'));
    it('should use the resolution a theme carries', () => {
        const carried: DesignSystem = structuredClone(design);
        carried.themes[0].modes[0].components = [{ name: 'Button', variants: [{ name: 'primary', parts: { background: '#000000' } }] }];
        resolvedComponentsIn(carried, 'Acme', 'light')[0].variants[0].parts.background.should.equal('#000000');
    });
    it('should resolve nothing for a mode that is not there', () => resolvedComponentsIn(design, 'Acme', 'sepia').should.deep.equal([]));
    it('should find one resolved variant', () => resolvedVariantIn(design, 'Acme', 'dark', 'Button', 'primary')!.parts.text.should.equal('#0b1220'));

    it('should list the default state first and the others in their usual order', () => statesOfVariant(menu.variants[0]).should.deep.equal(['default', 'hover', 'selected']));
    it('should list the states any variant of a component declares', () => statesOfComponent(button).should.deep.equal(['default', 'focus']));

    describe('and a variant is read in a state', () => {
        const variant = menu.variants[0];
        const resolved = resolvedVariantIn(design, 'Acme', 'light', 'Menu', 'default');

        it('should take the variant\'s own parts in the default state', () =>
            partsInState(variant, resolved, 'default').find(part => part.part === 'background')!.token.should.equal('color.surface'));
        it('should put a state\'s override over the variant\'s part', () =>
            partsInState(variant, resolved, 'hover').find(part => part.part === 'background')!.token.should.equal('color.hover'));
        it('should keep the parts a state does not override', () =>
            partsInState(variant, resolved, 'hover').find(part => part.part === 'text')!.token.should.equal('color.text'));
        it('should say what the part resolves to in the state', () =>
            partsInState(variant, resolved, 'hover').find(part => part.part === 'background')!.value.should.equal('#eff6ff'));
        it('should say nothing for a value that is not resolved', () => partsInState(variant, undefined, 'default').every(part => part.value === '').should.be.true);
    });

    it('should offer the colors for a text part', () => tokensForPart(design, 'text').every(address => address.startsWith('color.')).should.be.true);
    it('should offer the radii for a radius part', () => tokensForPart(design, 'radius').should.deep.equal(['radius.content']));
    it('should offer nothing for a part nobody knows', () => tokensForPart(design, 'flavor').should.deep.equal([]));

    it('should find a variant by name', () => variantOf(button, 'primary')!.name.should.equal('primary'));
    it('should fall back to the first variant', () => variantOf(menu, 'nope')!.name.should.equal('default'));
    it('should find none for no component', () => (variantOf(undefined, 'primary') === undefined).should.be.true);

    it('should complete a design system that carries only some lists', () => {
        const completed = completeDesignSystem({ name: 'Partial' })!;
        [completed.modes, completed.tokens, completed.components, completed.themes].should.deep.equal([[], [], [], []]);
    });
    it('should complete nothing for no design system', () => (completeDesignSystem(undefined) === undefined).should.be.true);
    it('should complete nothing for a design system with no name', () => (completeDesignSystem({ modes: ['light'] }) === undefined).should.be.true);
});
