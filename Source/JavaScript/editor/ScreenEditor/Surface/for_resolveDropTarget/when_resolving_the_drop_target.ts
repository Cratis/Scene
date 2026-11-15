// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DropRegionKind } from '../../DropRegions/DropRegionKind';
import { InsertionAxis } from '../../DropRegions/InsertionAxis';
import type { DropRegion } from '../../DropRegions/DropRegion';
import type { PlacedRegion, Rect } from '../dropRegionRects';
import { resolveDropTarget } from '../resolveDropTarget';

const container = (id: string, containerId: string, rect: Rect, isEmptyContainer = false, axis = InsertionAxis.Horizontal): PlacedRegion =>
    ({ region: { id, kind: DropRegionKind.Container, containerId, index: 0, axis, isEmptyContainer } as DropRegion, rect });
const between = (id: string, containerId: string, index: number, rect: Rect, axis = InsertionAxis.Horizontal): PlacedRegion =>
    ({ region: { id, kind: DropRegionKind.Between, containerId, index, axis, isEmptyContainer: false } as DropRegion, rect });

// A screen 400 wide and 300 high holding a column with two children, 100 apart, and below it an empty container.
const root = container('root:container', 'root', { left: 0, top: 0, width: 400, height: 300 });
const rootMarkers = [
    between('root:between:0', 'root', 0, { left: 0, top: -1, width: 400, height: 3 }),
    between('root:between:1', 'root', 1, { left: 0, top: 99, width: 400, height: 3 }),
    between('root:between:2', 'root', 2, { left: 0, top: 199, width: 400, height: 3 }),
];
const empty = container('empty:container', 'empty', { left: 20, top: 220, width: 200, height: 48 }, true);
const regions = [root, ...rootMarkers, empty];

describe('when the pointer is over a container with children', () => {
    const resolved = resolveDropTarget(regions, 200, 130)!;

    it('should drop at the marker nearest the pointer, without the pointer having to hit it', () => resolved.target.region.id.should.equal('root:between:1'));
    it('should name the container that receives it', () => resolved.container.should.deep.equal(root.rect));
});

describe('when the pointer is nearer the end of the container', () => {
    it('should drop after the last child', () => resolveDropTarget(regions, 200, 190)!.target.region.id.should.equal('root:between:2'));
});

describe('when the pointer is over an empty container', () => {
    const resolved = resolveDropTarget(regions, 100, 240)!;

    it('should drop into the empty container', () => resolved.target.region.id.should.equal('empty:container'));
    it('should outline that container', () => resolved.container.should.deep.equal(empty.rect));
});

describe('when the pointer is on the very edge of an empty container', () => {
    it('should drop beside it, in the container around it', () => resolveDropTarget(regions, 21, 240)!.target.region.id.should.match(/^root:between/));
});

describe('when the pointer is outside every container', () => {
    const resolved = resolveDropTarget([container('shell:container', 'shell', { left: 0, top: 0, width: 200, height: 100 }), root], 390, 290)!;

    it('should fall back to the outermost container', () => resolved.target.region.containerId?.should.equal('root'));
});

describe('when the pointer is over the empty part of an empty screen', () => {
    it('should drop into the screen', () => resolveDropTarget([container('screen:container', 'screen', { left: 0, top: 0, width: 400, height: 48 }, true)], 200, 250)!.target.region.id.should.equal('screen:container'));
});

describe('when children are laid out in a row', () => {
    const row = container('row:container', 'row', { left: 0, top: 0, width: 300, height: 40 }, false, InsertionAxis.Vertical);
    const markers = [0, 1, 2].map(index => between(`row:between:${index}`, 'row', index, { left: index * 150 - 1, top: 0, width: 3, height: 40 }, InsertionAxis.Vertical));

    it('should measure the pointer across the row', () => resolveDropTarget([row, ...markers], 160, 5)!.target.region.id.should.equal('row:between:1'));
});

describe('when a freeform container offers no markers', () => {
    it('should drop into the container', () => resolveDropTarget([container('canvas:container', 'canvas', { left: 0, top: 0, width: 300, height: 200 }, false, InsertionAxis.None)], 100, 100)!.target.region.id.should.equal('canvas:container'));
});

describe('when a container wraps only another container of the same size', () => {
    const outer = container('outer:container', 'outer', { left: 0, top: 0, width: 200, height: 48 });
    const inner = container('inner:container', 'inner', { left: 0, top: 0, width: 200, height: 48 }, true);

    it('should drop into the inner one', () => resolveDropTarget([outer, inner], 100, 24)!.target.region.id.should.equal('inner:container'));
});

describe('when the pointer is inside a container too small for an edge band', () => {
    const small = container('small:container', 'small', { left: 0, top: 0, width: 200, height: 12 }, true);

    it('should still drop into it', () => resolveDropTarget([container('big:container', 'big', { left: 0, top: 0, width: 400, height: 300 }), small], 100, 6)!.target.region.id.should.equal('small:container'));
});

describe('when the screen offers nowhere to drop', () => {
    it('should resolve nothing', () => (resolveDropTarget([], 10, 10) === undefined).should.be.true);
});
