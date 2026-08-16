// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FlowArrangement, HeightSizeClass, WidthSizeClass } from '@cratis/scene.model';
import { evaluateFlowArrangement } from '@cratis/scene.engine';
import {
    appShellArrangement,
    appShellCompactHeightRoot,
    appShellCompactRoot,
    appShellCompactWidthRoot,
    appShellLayout,
    appShellRegularRoot,
} from '../layouts';

describe('when evaluating the arrangement at each size class', () => {
    const arrangement = appShellLayout.arrangement as FlowArrangement;

    const regular = evaluateFlowArrangement(arrangement, { width: WidthSizeClass.Regular, height: HeightSizeClass.Regular });
    const compactWidth = evaluateFlowArrangement(arrangement, { width: WidthSizeClass.Compact, height: HeightSizeClass.Regular });
    const compactHeight = evaluateFlowArrangement(arrangement, { width: WidthSizeClass.Regular, height: HeightSizeClass.Compact });
    const compactBoth = evaluateFlowArrangement(arrangement, { width: WidthSizeClass.Compact, height: HeightSizeClass.Compact });

    it('should use the full tree at a regular width and height', () => {
        regular.should.equal(appShellRegularRoot);
    });

    it('should collapse the sidebar out of the flow at a compact width', () => {
        compactWidth.should.equal(appShellCompactWidthRoot);
    });

    it('should drop the breadcrumb and footer at a compact height', () => {
        compactHeight.should.equal(appShellCompactHeightRoot);
    });

    it('should prefer the override targeting both axes when both are compact', () => {
        compactBoth.should.equal(appShellCompactRoot);
    });

    it('should be the layout declared on the blueprint', () => {
        arrangement.should.equal(appShellArrangement);
    });
});
