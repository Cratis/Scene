// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemKind, OutletKind, OutletNavigationItem } from '@cratis/scene.model';
import { OutletLevelKind, effectiveOutlet } from '@cratis/scene.engine';
import { galleryScreen, galleryScreenTemplates, navigationEntries, navigationGroups, navigationOutlet } from '../gallery';

describe('when contributing the navigation to its outlet', () => {
    const dashboard = galleryScreen('Dashboard')!;
    const resolved = effectiveOutlet(
        [
            { kind: OutletLevelKind.Layout, name: 'AppShell', outlets: [{ name: navigationOutlet, kind: OutletKind.Navigation, defaults: [] }] },
            { kind: OutletLevelKind.Screen, name: dashboard.name, contributions: dashboard.outletContributions },
        ],
        navigationOutlet);
    const groups = resolved.items.map(entry => entry.item as OutletNavigationItem);
    const items = groups.flatMap(group => group.children ?? []);

    it('should resolve without problems', () => resolved.diagnostics.should.be.empty);

    it('should contribute one navigation item per group, in first-declared order', () => {
        groups.map(group => group.title).should.deep.equal(navigationGroups);
    });

    it('should contribute every entry as a sub-item of its group', () => {
        items.should.have.lengthOf(navigationEntries.length);
        items.every(item => item.kind === OutletItemKind.Navigation).should.be.true;
    });

    it('should carry the title and target screen of the entry', () => {
        items.find(item => item.target?.screen === 'Dashboard')!.title.should.equal('Dashboard');
    });

    it('should point every entry at a screen template this blueprint provides', () => {
        const provided = new Set(galleryScreenTemplates.map(template => template.name));
        items.filter(item => !provided.has(item.target?.screen ?? '')).map(item => item.target?.screen).should.be.empty;
    });

    it('should point every entry at a screen the gallery actually ships', () => {
        items.filter(item => galleryScreen(item.target?.screen ?? '') === undefined).map(item => item.target?.screen).should.be.empty;
    });

    it('should not carry navigation on a full-page screen, which has no navigation to render', () => {
        (galleryScreen('Login')!.outletContributions === undefined).should.be.true;
    });
});
