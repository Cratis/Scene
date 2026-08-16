// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Arrangement, FlowArrangement, FlowContainer, FlowNode, Slot } from '@cratis/scene.model';
import { componentsDialogTemplates, componentsScreenTemplates } from '../templates';

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

/**
 * An arrangement leaf naming a slot the template never declared positions nothing, and reports nothing
 * either - the region simply is not there. No type can express "one of whatever this particular container
 * declared", so this is the check that stands in for one.
 */
describe('when checking that arrangements reference declared slots', () => {
    for (const template of componentsScreenTemplates.filter(candidate => candidate.arrangement !== undefined)) {
        it(`should reference only slots the '${template.name}' template declares`, () => {
            undeclared(template.slots, template.arrangement).should.be.empty;
        });
    }

    for (const template of componentsScreenTemplates) {
        it(`should file '${template.name}' content only under slots it declares`, () => {
            const declared = new Set(template.slots.map(slot => slot.name));
            Object.keys(template.content ?? {}).filter(name => !declared.has(name)).should.be.empty;
        });
    }

    for (const template of componentsDialogTemplates) {
        it(`should file '${template.name}' dialog content only under slots it declares`, () => {
            const declared = new Set(template.slots.map(slot => slot.name));
            Object.keys(template.content ?? {}).filter(name => !declared.has(name)).should.be.empty;
        });
    }

    it('should give every dialog template exactly one slot, since the composites own their own chrome', () => {
        componentsDialogTemplates.filter(template => template.slots.length !== 1).should.be.empty;
    });

    it('should give no dialog template a fitsSlot, because an overlay occupies no slot', () => {
        componentsDialogTemplates.filter(template => 'fitsSlot' in template).should.be.empty;
    });
});
