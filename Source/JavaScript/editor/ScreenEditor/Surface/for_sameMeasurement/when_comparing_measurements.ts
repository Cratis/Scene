// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DropRegionKind } from '../../DropRegions/DropRegionKind';
import { InsertionAxis } from '../../DropRegions/InsertionAxis';
import type { PlacedRegion } from '../dropRegionRects';
import { sameRegions, sameSelection } from '../sameMeasurement';

const placed = (id: string, left: number): PlacedRegion => ({
    region: { id, kind: DropRegionKind.Between, containerId: 'c', index: 0, axis: InsertionAxis.Horizontal, isEmptyContainer: false },
    rect: { left, top: 0, width: 10, height: 3 },
});

describe('when comparing two measurements of the surface', () => {
    it('should call identical regions the same, even as new objects', () => sameRegions([placed('a', 1)], [placed('a', 1)]).should.be.true);
    it('should call a moved region different', () => sameRegions([placed('a', 1)], [placed('a', 2)]).should.be.false);
    it('should call a different set of regions different', () => sameRegions([placed('a', 1)], [placed('b', 1)]).should.be.false);
    it('should call a different number of regions different', () => sameRegions([placed('a', 1)], []).should.be.false);
    it('should call two missing selections the same', () => sameSelection(undefined, undefined).should.be.true);
    it('should call a selection that appeared different', () => sameSelection(undefined, { left: 0, top: 0, width: 1, height: 1 }).should.be.false);
    it('should call an equal selection the same', () => sameSelection({ left: 0, top: 0, width: 1, height: 1 }, { left: 0, top: 0, width: 1, height: 1 }).should.be.true);
});
