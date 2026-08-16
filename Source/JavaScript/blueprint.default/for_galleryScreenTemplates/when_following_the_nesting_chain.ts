// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Slot } from '@cratis/scene.model';
import { appShellLayout, fullPageLayout } from '../layouts';
import { featureSectionTemplate, galleryScreenTemplates, moduleWorkspaceTemplate, sliceSectionTemplate } from '../gallery';

function declares(slots: Slot[], name: string | undefined): boolean {
    return name !== undefined && slots.some(slot => slot.name === name);
}

describe('when following the nesting chain', () => {
    it('should fit the module template into a slot the application layout declares', () => {
        declares(appShellLayout.slots, moduleWorkspaceTemplate.fitsSlot).should.be.true;
    });

    it('should fit the feature template into a slot the module template declares', () => {
        declares(moduleWorkspaceTemplate.slots, featureSectionTemplate.fitsSlot).should.be.true;
    });

    it('should fit the slice template into a slot the feature template declares', () => {
        declares(featureSectionTemplate.slots, sliceSectionTemplate.fitsSlot).should.be.true;
    });

    it('should resolve each level against its direct parent rather than globally', () => {
        featureSectionTemplate.fitsSlot!.should.equal(sliceSectionTemplate.fitsSlot!);
    });

    it('should fit every other template into a slot one of the layouts declares', () => {
        const layoutSlots = [...appShellLayout.slots, ...fullPageLayout.slots];
        const templateSlots = galleryScreenTemplates.flatMap(template => template.slots);
        galleryScreenTemplates
            .filter(template => !declares(layoutSlots, template.fitsSlot) && !declares(templateSlots, template.fitsSlot))
            .map(template => template.name)
            .should.be.empty;
    });

    it('should give every screen template a slot to fit into', () => {
        galleryScreenTemplates.filter(template => template.fitsSlot === undefined).map(template => template.name).should.be.empty;
    });
});
