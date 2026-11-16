// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ProfileSection, describeRegions, NavigationMode } from '@cratis/scene.engine';
import { inspectorSections, sectionAtScroll, sectionOfRegion } from '../Inspector/ProfileSection';

const tops = [0, 400, 900, 1500, 2100, 2800];

describe('when the inspector has six sections', () => {
    it('should list them in the order they are scrolled through', () => inspectorSections.should.deep.equal([ProfileSection.App, ProfileSection.Shell, ProfileSection.Look, ProfileSection.Menu, ProfileSection.Packages, ProfileSection.SampleData]));
});

describe('when following the scroll', () => {
    it('should be the first section at the top', () => sectionAtScroll(tops, 0).should.equal(0));
    it('should stay on a section until the next one starts', () => sectionAtScroll(tops, 350).should.equal(0));
    it('should change a little before the next heading reaches the edge', () => sectionAtScroll(tops, 365).should.equal(1));
    it('should be a middle section inside it', () => sectionAtScroll(tops, 1000).should.equal(2));
    it('should be the last section at the bottom', () => sectionAtScroll(tops, 5000).should.equal(5));
    it('should never be before the first section', () => sectionAtScroll(tops, -50).should.equal(0));
    it('should take the allowance it is given', () => sectionAtScroll(tops, 380, 0).should.equal(0));
    it('should answer for no sections', () => sectionAtScroll([], 100).should.equal(0));
});

describe('when asking which section a region edits', () => {
    const regions = describeRegions(NavigationMode.Static, false, false);

    it('should lead the identity to App', () => sectionOfRegion('identity', regions)!.should.equal(ProfileSection.App));
    it('should lead the shell to Shell', () => sectionOfRegion('shell', regions)!.should.equal(ProfileSection.Shell));
    it('should lead the menu to Menu', () => sectionOfRegion('menu', regions)!.should.equal(ProfileSection.Menu));
    it('should lead the content to Sample data', () => sectionOfRegion('content', regions)!.should.equal(ProfileSection.SampleData));
    it('should lead the accent to Look', () => sectionOfRegion('accent', regions)!.should.equal(ProfileSection.Look));
    it('should lead a region nobody knows nowhere', () => (sectionOfRegion('hamburger', regions) === undefined).should.be.true);
});
