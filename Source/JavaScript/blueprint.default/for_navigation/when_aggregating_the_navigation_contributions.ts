// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationItem } from '@cratis/scene.model';
import { aggregateContributions } from '@cratis/scene.engine';
import { extractNavigationItem } from '@cratis/scene.react';
import { galleryScreen, galleryScreenTemplates, navigationContributionPoint, navigationContributions, navigationEntries } from '../gallery';

describe('when aggregating the navigation contributions', () => {
    const aggregated = aggregateContributions(navigationContributions, navigationContributionPoint);
    const items = aggregated.map(extractNavigationItem).filter((item): item is NavigationItem => item !== undefined);

    it('should aggregate one contribution per navigation entry', () => {
        aggregated.should.have.lengthOf(navigationEntries.length);
    });

    it('should extract every one of them as a navigation item', () => {
        items.should.have.lengthOf(navigationEntries.length);
    });

    it('should carry the label and target screen through the property bag unchanged', () => {
        const dashboard = items.find(item => item.targetScreen === 'Dashboard');
        dashboard!.label.should.equal('Dashboard');
    });

    it('should carry the group so an aggregated navigation can section itself', () => {
        items.filter(item => item.group === undefined).should.be.empty;
    });

    it('should carry a route parameter bag rather than leaving it undefined', () => {
        items.filter(item => item.routeParameterBindings === undefined).should.be.empty;
    });

    it('should point every entry at a screen template this blueprint provides', () => {
        const provided = new Set(galleryScreenTemplates.map(template => template.name));
        items.filter(item => !provided.has(item.targetScreen)).map(item => item.targetScreen).should.be.empty;
    });

    it('should point every entry at a screen the gallery actually ships', () => {
        items.filter(item => galleryScreen(item.targetScreen) === undefined).map(item => item.targetScreen).should.be.empty;
    });

    it('should carry the contributions on every application-shell screen', () => {
        galleryScreen('Dashboard')!.contributions.should.have.lengthOf(navigationEntries.length);
    });

    it('should not carry navigation on a full-page screen, which has no navigation to render', () => {
        galleryScreen('Login')!.contributions.should.be.empty;
    });
});
