// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfileSettings } from '../UiProfileSettings';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';
import { resolveUiProfile } from '../resolveUiProfile';
import { canMovePackage, movePackage } from '../movePackage';
import { aStandaloneLibrary, bundlesWith } from '../given/aStandaloneLibrary';

describe('when moving a package in priority', () => {
    const bundles = bundlesWith(aStandaloneLibrary('Leaf'));
    let settings: UiProfileSettings;

    beforeEach(() => {
        settings = { ...defaultUiProfileSettings(bundles), packages: ['PrimeReact', 'Tailwind', 'Leaf'] };
    });

    it('should move an independent package when the resolved order changes', () => {
        const moved = movePackage(settings, 'Leaf', -1, bundles)!;
        moved.packages.should.deep.equal(['PrimeReact', 'Leaf', 'Tailwind']);
        const order = resolveUiProfile(moved, bundles).profile.packages;
        order.indexOf('Leaf').should.be.lessThan(order.indexOf('Tailwind'));
    });

    // Scene orders the libraries a profile lists as they are listed (core and the default library first, blueprints last), so a
    // styling package is no longer pinned ahead of the library that builds on it.
    it('should move a package past the one that builds on it, since Scene orders the listed libraries as listed', () => {
        const listed = { ...settings, packages: ['Tailwind', 'PrimeReact'] };
        (movePackage(listed, 'Tailwind', 1, bundles) === undefined).should.be.false;
        canMovePackage(listed, 'Tailwind', 1, bundles).should.be.true;
    });

    it('should not move the first package up past the start or the last past the end', () => {
        canMovePackage(settings, 'PrimeReact', -1, bundles).should.be.false;
        canMovePackage(settings, 'Leaf', 1, bundles).should.be.false;
    });

    it('should not move a package that is not chosen', () => {
        canMovePackage(settings, 'Cratis.Components', 1, bundles).should.be.false;
    });
});
