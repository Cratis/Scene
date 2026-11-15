// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isValidElement, type ReactElement } from 'react';
import { blueprintPreviewBundles } from '../../../BlueprintPreview/blueprintPreviewCatalog';
import { defaultPaletteIcons } from '../defaultPaletteIcons';
import { defaultPaletteSources } from '../defaultPaletteSources';
import { defaultPackageIcons, unknownPackageIcon } from '../defaultPackageIcons';

const typeOf = (node: unknown) => (node as ReactElement).type;
const packagesOfferingComponents = defaultPaletteSources.filter(source => source.components.length > 0).map(source => source.package);

describe('when drawing the drawer icons for the packages the editor ships', () => {
    const icons = packagesOfferingComponents.map(name => typeOf(defaultPaletteIcons.drawer.package(name)));

    it('should have a drawer for each package that offers components', () => packagesOfferingComponents.length.should.be.greaterThan(3));
    it('should give every package its own icon', () => new Set(icons).size.should.equal(icons.length));
    it('should not reuse the layout drawer icon for any of them', () => icons.includes(typeOf(defaultPaletteIcons.drawer.layout)).should.be.false);
    it('should draw an element', () => packagesOfferingComponents.every(name => isValidElement(defaultPaletteIcons.drawer.package(name))).should.be.true);
});

describe('when drawing the drawer icon of a package the editor does not know', () => {
    it('should fall back to the generic icon', () => typeOf(defaultPaletteIcons.drawer.package('Acme.Widgets')).should.equal(unknownPackageIcon));
});

describe('when listing the icons the editor knows', () => {
    it('should know a package only by a name the editor ships', () => Object.keys(defaultPackageIcons).every(name => blueprintPreviewBundles.some(bundle => bundle.manifest.name === name)).should.be.true);
});

describe('when drawing the icon of every component the palette offers', () => {
    const offered = defaultPaletteSources.flatMap(source => source.components.map(name => ({ source: source.package, name })));
    const cube = typeOf(defaultPaletteIcons.drawer.package('Acme.Widgets'));

    it('should give each one an icon', () => offered.every(({ name }) => isValidElement(defaultPaletteIcons.component(name))).should.be.true);
    it('should not draw any of them with the generic cube', () => offered.some(({ name }) => typeOf(defaultPaletteIcons.component(name)) === cube).should.be.false);
    it('should not draw every component of a package with the same icon', () =>
        defaultPaletteSources.filter(source => source.components.length > 1).every(source => new Set(source.components.map(name => typeOf(defaultPaletteIcons.component(name)))).size > 1).should.be.true);
    it('should give the same component the same icon whichever package offers it', () => typeOf(defaultPaletteIcons.component('button')).should.equal(typeOf(defaultPaletteIcons.component('button'))));
});
