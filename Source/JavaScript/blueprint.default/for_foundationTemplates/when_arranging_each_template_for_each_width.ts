// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FlowArrangement, FlowContainer, FlowContainerKind, FlowNode, HeightSizeClass, WidthSizeClass } from '@cratis/scene.model';
import { evaluateFlowArrangement } from '@cratis/scene.engine';
import { foundationScreenTemplates } from '../foundation/templates';

const containsGrid = (node: FlowNode): boolean => {
    const container = node as FlowNode & { kind?: FlowContainerKind; children?: FlowNode[] };
    return container.kind === FlowContainerKind.Grid || (container.children ?? []).some(containsGrid);
};
const slotsIn = (node: FlowNode): string[] => ('slotName' in node ? [(node as { slotName: string }).slotName] : 'children' in node ? (node as FlowContainer).children.flatMap(slotsIn) : []);
const evaluate = (template: { arrangement?: unknown }, width: WidthSizeClass) => evaluateFlowArrangement(template.arrangement as FlowArrangement, { width, height: HeightSizeClass.Regular });
const sideBySide = ['WorkspaceScreen', 'DashboardScreen', 'MasterDetailScreen', 'RecordPage'];

// Part B 1.5 responsive: "list screens collapse to cards on phone, master-detail becomes navigation stack, sidebar becomes drawer".
// The arrangement is the declaration of that for every template: every slot is placed at every width, and what sits side by side on a desktop
// is one column on a phone.
describe('when arranging each foundation template for each width', () => {
    for (const template of foundationScreenTemplates) {
        const declared = template.slots.map(slot => slot.name);

        for (const width of [WidthSizeClass.Regular, WidthSizeClass.Compact]) {
            it(`should place every slot of ${template.name} exactly once at a ${width} width`, () => {
                [...slotsIn(evaluate(template, width))].sort().should.deep.equal([...declared].sort());
            });
        }

        it(`should stack ${template.name} in one column at a compact width`, () => containsGrid(evaluate(template, WidthSizeClass.Compact)).should.equal(false));
    }

    for (const name of sideBySide) {
        it(`should place ${name}'s regions side by side at a regular width`, () => containsGrid(evaluate(foundationScreenTemplates.find(template => template.name === name)!, WidthSizeClass.Regular)).should.equal(true));
    }

    it('should read the master/detail as a navigation stack on a phone: the list, then the record', () => {
        const masterDetail = foundationScreenTemplates.find(template => template.name === 'MasterDetailScreen')!;
        slotsIn(evaluate(masterDetail, WidthSizeClass.Compact)).should.deep.equal(['list', 'details']);
        masterDetail.outlets!.should.deep.equal([{ name: 'master-detail.detail', description: 'The selected record.', accepts: ['Detail'] }]);
    });

    it('should put the workspace sections before its content on a phone, where the rail reads as tabs', () => {
        slotsIn(evaluate(foundationScreenTemplates.find(template => template.name === 'WorkspaceScreen')!, WidthSizeClass.Compact)).should.deep.equal(['moduleNav', 'moduleContent']);
    });
});
