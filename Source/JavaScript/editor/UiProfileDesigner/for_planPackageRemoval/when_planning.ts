// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ProfileBlockerKind } from '../../UiProfile/ProfileBlockerKind';
import type { ProfileUsage } from '../../UiProfile/ProfileUsage';
import { defaultUiProfileSettings } from '../../UiProfile/defaultUiProfileSettings';
import { aStandaloneLibrary, bundlesWith } from '../../UiProfile/given/aStandaloneLibrary';
import { PackageRemovalKind } from '../PackageList/PackageRemoval';
import { planPackageRemoval } from '../PackageList/planPackageRemoval';

const bundles = bundlesWith(aStandaloneLibrary('Leaf', ['leafWidget']), aStandaloneLibrary('Spare', ['spareWidget']));
const settings = { ...defaultUiProfileSettings(bundles), packages: ['PrimeReact', 'Tailwind', 'Leaf', 'Spare'] };
const usage = (...components: string[]): ProfileUsage => ({ screen: 'Orders', layouts: [], screenTemplates: [], dialogTemplates: [], components, slots: [] });

describe('when planning the removal of a package nothing relies on', () => {
    const plan = planPackageRemoval(settings, 'Spare', false, bundles, [usage('leafWidget')]);

    it('should allow it', () => plan.kind.should.equal(PackageRemovalKind.Allowed));
    it('should give the profile without it', () => plan.settings.packages.should.not.include('Spare'));
});

describe('when planning the removal of core', () => {
    const plan = planPackageRemoval(settings, 'core', false, bundles, []);

    it('should say it is fixed', () => plan.kind.should.equal(PackageRemovalKind.Fixed));
    it('should leave the profile as it was', () => plan.settings.should.equal(settings));
});

describe('when planning the removal of a package another one needs', () => {
    const plan = planPackageRemoval(settings, 'Tailwind', false, bundles, []);

    it('should say it is still required', () => plan.kind.should.equal(PackageRemovalKind.StillRequired));
    it('should name what needs it', () => plan.requiredBy.should.include('PrimeReact'));
    it('should drop only the choice to have it', () => plan.settings.packages.should.not.include('Tailwind'));
});

describe('when planning the removal of a package a screen uses', () => {
    const plan = planPackageRemoval(settings, 'Leaf', false, bundles, [usage('leafWidget')]);

    it('should say it breaks something', () => plan.kind.should.equal(PackageRemovalKind.Breaks));
    it('should name the component that would be missing', () => plan.blockers.some(blocker => blocker.kind === ProfileBlockerKind.UsedComponentUnavailable && blocker.subject === 'leafWidget').should.be.true);
    it('should leave the profile as it was', () => plan.settings.should.equal(settings));
});

describe('when the breakage already exists', () => {
    const broken = { ...settings, packages: ['PrimeReact', 'Tailwind', 'Spare'] };
    const plan = planPackageRemoval(broken, 'Spare', false, bundles, [usage('leafWidget')]);

    it('should only report what removing the package adds', () => plan.blockers.some(blocker => blocker.subject === 'leafWidget').should.be.false);
});

describe('when planning to stop offering a blueprint\'s templates', () => {
    const offering = { ...settings, templatePacks: ['Cratis.Blueprint.Components'] };
    const plan = planPackageRemoval(offering, 'Cratis.Blueprint.Components', true, bundles, []);

    it('should allow it when no screen needs them', () => plan.kind.should.equal(PackageRemovalKind.Allowed));
    it('should stop offering them', () => plan.settings.templatePacks.should.be.empty);
});
