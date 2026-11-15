// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultUiProfileSettings } from '../../UiProfile/defaultUiProfileSettings';
import { aStandaloneLibrary, bundlesWith } from '../../UiProfile/given/aStandaloneLibrary';
import { reorderPackage } from '../PackageList/reorderPackage';

describe('when dropping a package on another', () => {
    const bundles = bundlesWith(aStandaloneLibrary('Leaf', ['leafWidget']), aStandaloneLibrary('Other', ['otherWidget']));
    const settings = { ...defaultUiProfileSettings(bundles), packages: ['PrimeReact', 'Tailwind', 'Leaf', 'Other'] };

    it('should take its place', () => reorderPackage(settings, 'Other', 'Leaf', bundles)!.packages.should.deep.equal(['PrimeReact', 'Tailwind', 'Other', 'Leaf']));
    it('should move it across several packages at once', () => reorderPackage(settings, 'Other', 'PrimeReact', bundles)!.packages[0].should.equal('Other'));
    it('should do nothing when dropped on itself', () => (reorderPackage(settings, 'Leaf', 'Leaf', bundles) === undefined).should.be.true);
    it('should refuse a package that is not chosen', () => (reorderPackage(settings, 'Cratis.Components', 'Leaf', bundles) === undefined).should.be.true);
});
