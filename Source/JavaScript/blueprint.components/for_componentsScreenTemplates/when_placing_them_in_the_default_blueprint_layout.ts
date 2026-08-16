// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { resolveScreenTemplates } from '@cratis/scene.engine';
import { appShellLayout, defaultBlueprint } from '@cratis/scene.blueprint.default';
import { componentsPageTemplates } from '../templates';

/**
 * The page templates are resolved against the default blueprint's layout *and its templates*, because that
 * is the situation an application is actually in: a profile that activates both blueprints has every one of
 * those templates in scope, and a `fitsSlot` that became ambiguous once they were is a `fitsSlot` that
 * works only in isolation.
 *
 * Only this package's templates are asserted on. The default blueprint's own nesting chain reuses `body` at
 * three levels, so it is reported unplaced in this combined scope - which is `resolveScreenTemplates`
 * behaving correctly, and not this package's result to claim or to fix.
 */
describe('when placing them in the default blueprint layout', () => {
    const templates = [...(defaultBlueprint.screenTemplates ?? []), ...componentsPageTemplates];
    const resolution = resolveScreenTemplates(appShellLayout, templates);
    const ownNames = new Set(componentsPageTemplates.map(template => template.name));
    const ownPlacements = resolution.placements.filter(placement => ownNames.has(placement.template));

    it('should have templates to place', () => {
        componentsPageTemplates.should.not.be.empty;
    });

    it('should place every one of them', () => {
        ownPlacements.map(placement => placement.template).sort().should.deep.equal([...ownNames].sort());
    });

    it('should leave none of them unplaced, even with the other blueprint templates in scope', () => {
        resolution.unplaced.filter(unplaced => ownNames.has(unplaced.template)).should.be.empty;
    });

    it('should place every one directly inside the layout rather than inside another template', () => {
        ownPlacements.filter(placement => placement.container !== appShellLayout.name).should.be.empty;
    });

    it('should place every one at the first level below the layout', () => {
        ownPlacements.filter(placement => placement.depth !== 1).should.be.empty;
    });

    it('should place every one in the content slot, which is the only region a layout offers a screen', () => {
        ownPlacements.filter(placement => placement.slot !== 'content').should.be.empty;
    });

    it('should introduce no nesting cycle', () => {
        resolution.cycles.should.deep.equal([]);
    });
});
