// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FlowArrangement, FlowContainerKind, FlowNode, HeightSizeClass, WidthSizeClass } from '@cratis/scene.model';
import { evaluateFlowArrangement } from '@cratis/scene.engine';
import { dashboardTemplate, masterDetailTemplate } from '../gallery';

function containsGrid(node: FlowNode): boolean {
    const container = node as FlowNode & { kind?: FlowContainerKind; children?: FlowNode[] };
    return container.kind === FlowContainerKind.Grid || (container.children ?? []).some(containsGrid);
}

describe('when arranging data templates at a compact width', () => {
    for (const template of [dashboardTemplate, masterDetailTemplate]) {
        const arrangement = template.arrangement as FlowArrangement;

        it(`should place ${template.name}'s regions side by side at a regular width`, () =>
            containsGrid(evaluateFlowArrangement(arrangement, { width: WidthSizeClass.Regular, height: HeightSizeClass.Regular })).should.equal(true));

        it(`should stack ${template.name}'s regions in one column at a compact width`, () =>
            containsGrid(evaluateFlowArrangement(arrangement, { width: WidthSizeClass.Compact, height: HeightSizeClass.Regular })).should.equal(false));
    }

    it('should let a row open a detail screen in the master/detail outlet only', () =>
        masterDetailTemplate.outlets!.should.deep.equal([{ name: 'master-detail.detail', description: 'The selected record.', accepts: ['Detail'] }]));
});
