// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { NavigationMode, describeShellCards, navigationModes } from '@cratis/scene.engine';
import { defaultBlueprint } from '../defaultBlueprint';
import { menuModeCards } from '../shell/menuModeCards';

describe('when describing the shell cards of the default blueprint', () => {
    const cards = describeShellCards({ blueprints: [defaultBlueprint] });

    it('should offer Cratis Default, Dashboard and Minimal', () => cards.map(card => card.title).should.deep.equal(['Cratis Default', 'Dashboard', 'Minimal']));
    it('should start them in Static, Horizontal and Slim', () => cards.map(card => card.defaultMenuMode).should.deep.equal([NavigationMode.Static, NavigationMode.Horizontal, NavigationMode.Slim]));
    it('should describe each in a line', () => cards.every(card => card.description.length > 10 && card.description.length < 100).should.be.true);
    it('should not offer the full-page shell, which has no menu', () => cards.some(card => card.id === 'FullPage').should.be.false);
    it('should ship a wireframe for each in the thumbnails folder', () =>
        cards.every(card => existsSync(join(import.meta.dirname, '..', card.thumbnail))).should.be.true);
});

describe('when describing the menu mode cards of the default blueprint', () => {
    it('should have a card for each of the eight modes, in the engine\'s order', () => menuModeCards.map(card => card.mode).should.deep.equal(navigationModes.map(mode => mode.id)));
    it('should use the engine\'s name and description', () => menuModeCards.map(card => [card.label, card.description]).should.deep.equal(navigationModes.map(mode => [mode.label, mode.description])));
    it('should draw each as an svg', () => menuModeCards.every(card => card.schematic.startsWith('<svg') && card.schematic.endsWith('</svg>')).should.be.true);
    it('should draw each differently', () => new Set(menuModeCards.map(card => card.schematic)).size.should.equal(8));
    it('should draw the drawer with its scrim and the overlay without', () => {
        const scrim = (mode: NavigationMode) => menuModeCards.find(card => card.mode === mode)!.schematic.includes('fill="#000"');
        [scrim(NavigationMode.Drawer), scrim(NavigationMode.Overlay)].should.deep.equal([true, false]);
    });
    it('should draw reveal with a ghost of the expanded panel', () => menuModeCards.find(card => card.mode === NavigationMode.Reveal)!.schematic.should.contain('stroke-dasharray'));
});
