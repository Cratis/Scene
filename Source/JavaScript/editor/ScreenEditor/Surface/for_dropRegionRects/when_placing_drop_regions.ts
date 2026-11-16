// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DropRegionKind } from '../../DropRegions/DropRegionKind';
import { InsertionAxis } from '../../DropRegions/InsertionAxis';
import type { DropRegion } from '../../DropRegions/DropRegion';
import { placeRegion, type Rect } from '../dropRegionRects';

const surface: Rect = { left: 0, top: 0, width: 400, height: 300 };
const rects: Record<string, Rect> = {
    column: { left: 10, top: 10, width: 200, height: 100 },
    a: { left: 10, top: 10, width: 200, height: 30 },
    b: { left: 10, top: 50, width: 200, height: 30 },
    row: { left: 10, top: 150, width: 200, height: 40 },
    left: { left: 10, top: 150, width: 80, height: 40 },
    empty: { left: 250, top: 20, width: 100, height: 60 },
};
const rectOf = (id: string) => rects[id];
const region = (partial: Partial<DropRegion>): DropRegion => ({ id: 'r', kind: DropRegionKind.Between, containerId: 'column', index: 0, axis: InsertionAxis.Horizontal, isEmptyContainer: false, ...partial });

describe('when placing the region of an empty container', () => {
    it('should cover the whole container, since there is nothing inside to mark', () =>
        placeRegion(region({ kind: DropRegionKind.Container, containerId: 'empty', isEmptyContainer: true }), surface, rectOf)!.should.deep.equal(rects.empty));
});

describe('when placing a marker between two stacked siblings', () => {
    const rect = placeRegion(region({ index: 1, afterId: 'a', beforeId: 'b' }), surface, rectOf)!;

    it('should span the container\'s width', () => rect.width.should.equal(200));
    it('should sit in the gap below the first sibling', () => (rect.top < 50 && rect.top + rect.height > 40).should.be.true);
});

describe('when placing a marker before the first sibling', () => {
    it('should sit at the top edge of that sibling', () => placeRegion(region({ beforeId: 'a' }), surface, rectOf)!.top.should.be.lessThan(10));
});

describe('when placing a marker after the last sibling', () => {
    it('should sit at the bottom edge of that sibling', () => placeRegion(region({ index: 2, afterId: 'b' }), surface, rectOf)!.top.should.be.greaterThan(78));
});

describe('when placing a marker beside siblings in a row', () => {
    const rect = placeRegion(region({ containerId: 'row', axis: InsertionAxis.Vertical, index: 1, afterId: 'left' }), surface, rectOf)!;

    it('should be a vertical bar', () => (rect.width < rect.height).should.be.true);
    it('should sit after the earlier sibling', () => (rect.left + rect.width / 2).should.equal(90));
});

describe('when placing a region on the screen itself', () => {
    it('should use the surface as the container', () => placeRegion(region({ kind: DropRegionKind.Container, containerId: null }), surface, rectOf)!.should.deep.equal(surface));
});

describe('when the container has not been drawn', () => {
    it('should place nothing', () => (placeRegion(region({ containerId: 'ghost' }), surface, rectOf) === undefined).should.be.true);
});

describe('when a freeform container offers no markers', () => {
    it('should place nothing', () => (placeRegion(region({ axis: InsertionAxis.None }), surface, rectOf) === undefined).should.be.true);
});
