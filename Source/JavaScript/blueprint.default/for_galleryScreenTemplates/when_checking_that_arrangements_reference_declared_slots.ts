// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Arrangement, FlowArrangement, FlowContainer, FlowNode, Slot } from '@cratis/scene.model';
import { defaultBlueprint } from '../defaultBlueprint';
import { galleryScreenTemplates } from '../gallery';

function slotNamesIn(node: FlowNode): string[] {
    if ('slotName' in node) {
        return [(node as { slotName: string }).slotName];
    }

    if ('children' in node) {
        return (node as FlowContainer).children.flatMap(slotNamesIn);
    }

    return [];
}

function referencedSlots(arrangement: Arrangement | undefined): string[] {
    const flow = arrangement as FlowArrangement | undefined;
    if (!flow?.root) {
        return [];
    }

    return [flow.root, ...(flow.overrides ?? []).map(override => override.root)].flatMap(slotNamesIn);
}

function undeclared(slots: Slot[], arrangement: Arrangement | undefined): string[] {
    const declared = new Set(slots.map(slot => slot.name));
    return [...new Set(referencedSlots(arrangement))].filter(name => !declared.has(name));
}

describe('when checking that arrangements reference declared slots', () => {
    for (const layout of defaultBlueprint.layouts ?? []) {
        it(`should reference only slots the '${layout.name}' layout declares`, () => {
            undeclared(layout.slots, layout.arrangement).should.be.empty;
        });
    }

    for (const template of galleryScreenTemplates.filter(candidate => candidate.arrangement !== undefined)) {
        it(`should reference only slots the '${template.name}' template declares`, () => {
            undeclared(template.slots, template.arrangement).should.be.empty;
        });
    }

    for (const template of galleryScreenTemplates) {
        it(`should file '${template.name}' content only under slots it declares`, () => {
            const declared = new Set(template.slots.map(slot => slot.name));
            Object.keys(template.content ?? {}).filter(name => !declared.has(name)).should.be.empty;
        });
    }
});
