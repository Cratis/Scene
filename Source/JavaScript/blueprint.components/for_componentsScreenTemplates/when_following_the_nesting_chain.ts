// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isScreenTemplateResolutionValid, resolveScreenTemplates } from '@cratis/scene.engine';
import { appShellLayout } from '@cratis/scene.blueprint.default';
import { nestingChainTemplates } from '../templates';

/**
 * The three-level chain, put through the real resolver rather than checked by walking slot lists.
 *
 * "It composes recursively" is the kind of claim that is true in a design document and wrong in the code,
 * and the way it goes wrong is specific: a chain that reuses one slot name at several levels reads
 * perfectly and resolves to nothing, because the resolver refuses to guess which of two containers a
 * template belongs to. Only running it proves the chain is really placeable.
 */
describe('when following the nesting chain', () => {
    const resolution = resolveScreenTemplates(appShellLayout, nestingChainTemplates);
    const placementOf = (name: string) => resolution.placements.find(placement => placement.template === name);

    it('should be a valid resolution', () => {
        isScreenTemplateResolutionValid(resolution).should.be.true;
    });

    it('should place all three levels', () => {
        resolution.placements.should.have.lengthOf(3);
    });

    it('should leave nothing unplaced', () => {
        resolution.unplaced.should.be.empty;
    });

    describe('and it is the module level', () => {
        const placement = placementOf('DataModulePage')!;

        it('should sit directly inside the application layout', () => {
            placement.container.should.equal(appShellLayout.name);
        });

        it('should fill the content slot', () => {
            placement.slot.should.equal('content');
        });

        it('should be one level below the layout', () => {
            placement.depth.should.equal(1);
        });
    });

    describe('and it is the feature level', () => {
        const placement = placementOf('DataFeatureSection')!;

        it('should sit inside the module template', () => {
            placement.container.should.equal('DataModulePage');
        });

        it('should fill a slot the module template declares', () => {
            placement.slot.should.equal('body');
        });

        it('should be two levels below the layout', () => {
            placement.depth.should.equal(2);
        });
    });

    describe('and it is the slice level', () => {
        const placement = placementOf('CommandSliceSection')!;

        it('should sit inside the feature template', () => {
            placement.container.should.equal('DataFeatureSection');
        });

        it('should fill a slot the feature template declares', () => {
            placement.slot.should.equal('primary');
        });

        it('should be three levels below the layout', () => {
            placement.depth.should.equal(3);
        });
    });

    it('should order the placements shallowest first, so a caller can build the tree top down', () => {
        resolution.placements.map(placement => placement.depth).should.deep.equal([1, 2, 3]);
    });
});
