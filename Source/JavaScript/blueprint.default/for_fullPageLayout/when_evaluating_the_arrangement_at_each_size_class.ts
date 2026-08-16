// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FlowArrangement, FlowContainer, FlowSlotLeaf, HeightSizeClass, WidthSizeClass } from '@cratis/scene.model';
import { evaluateFlowArrangement } from '@cratis/scene.engine';
import { SlotName, fullPageCompactWidthRoot, fullPageLayout, fullPageRegularRoot } from '../layouts';

describe('when evaluating the arrangement at each size class', () => {
    const arrangement = fullPageLayout.arrangement as FlowArrangement;

    const regular = evaluateFlowArrangement(arrangement, { width: WidthSizeClass.Regular, height: HeightSizeClass.Regular });
    const compactWidth = evaluateFlowArrangement(arrangement, { width: WidthSizeClass.Compact, height: HeightSizeClass.Regular });
    const compactHeight = evaluateFlowArrangement(arrangement, { width: WidthSizeClass.Regular, height: HeightSizeClass.Compact });
    const compactBoth = evaluateFlowArrangement(arrangement, { width: WidthSizeClass.Compact, height: HeightSizeClass.Compact });

    it('should use the split tree at a regular width', () => {
        regular.should.equal(fullPageRegularRoot);
    });

    it('should keep the split tree at a compact height, which the width override does not target', () => {
        compactHeight.should.equal(fullPageRegularRoot);
    });

    it('should drop the branding aside at a compact width', () => {
        compactWidth.should.equal(fullPageCompactWidthRoot);
    });

    it('should drop the branding aside whenever the width is compact, whatever the height is', () => {
        compactBoth.should.equal(fullPageCompactWidthRoot);
    });

    it('should leave the compact-width tree with no reference to the aside slot', () => {
        const leaves = (fullPageCompactWidthRoot as FlowContainer).children as FlowSlotLeaf[];
        leaves.map(leaf => leaf.slotName).should.not.contain(SlotName.Aside);
    });
});
