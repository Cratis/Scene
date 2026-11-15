// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LayoutArrangement } from '../../Layouts/LayoutArrangement';
import { Ownership } from '../../Structure/Ownership';
import { container, leaf, testAdapter } from '../../Structure/given/testTree';
import { computeDropRegions } from '../computeDropRegions';
import { DropRegionKind } from '../DropRegionKind';
import { InsertionAxis } from '../InsertionAxis';

const regions = (roots: ReturnType<typeof container>[], surface = LayoutArrangement.Column) => computeDropRegions(roots, surface, testAdapter);

describe('when the screen holds an empty container', () => {
    const result = regions([container('empty', [], Ownership.Local, LayoutArrangement.Row)]);

    it('should give the empty container a region of its own', () =>
        result.some(region => region.containerId === 'empty' && region.kind === DropRegionKind.Container && region.isEmptyContainer).should.be.true);

    it('should not draw markers inside an empty container', () =>
        result.some(region => region.containerId === 'empty' && region.kind === DropRegionKind.Between).should.be.false);
});

describe('when a column holds three children', () => {
    const result = regions([container('column', [leaf('a'), leaf('b'), leaf('c')], Ownership.Local, LayoutArrangement.Column)]);
    const between = result.filter(region => region.containerId === 'column' && region.kind === DropRegionKind.Between);

    it('should offer a marker before, between and after the children', () => between.map(region => region.index).should.deep.equal([0, 1, 2, 3]));
    it('should draw the markers horizontally', () => between.every(region => region.axis === InsertionAxis.Horizontal).should.be.true);
    it('should say which siblings a middle marker sits between', () => {
        const middle = between[1];
        (middle.afterId === 'a' && middle.beforeId === 'b').should.be.true;
    });
});

describe('when a row holds children', () => {
    it('should draw the markers vertically', () =>
        regions([container('row', [leaf('a')], Ownership.Local, LayoutArrangement.Row)])
            .filter(region => region.containerId === 'row' && region.kind === DropRegionKind.Between)
            .every(region => region.axis === InsertionAxis.Vertical).should.be.true);
});

describe('when a freeform container holds children', () => {
    const result = regions([container('canvas', [leaf('a'), leaf('b')], Ownership.Local, LayoutArrangement.Freeform)]);

    it('should offer no order markers, because placement is by position', () =>
        result.some(region => region.containerId === 'canvas' && region.kind === DropRegionKind.Between).should.be.false);

    it('should still offer the container body', () =>
        result.some(region => region.containerId === 'canvas' && region.kind === DropRegionKind.Container).should.be.true);
});

describe('when a container is nested inside another', () => {
    it('should compute regions for the nested container too', () =>
        regions([container('outer', [container('inner', [], Ownership.Local, LayoutArrangement.Column)], Ownership.Local, LayoutArrangement.Column)])
            .some(region => region.containerId === 'inner').should.be.true);
});

describe('when a container is inherited', () => {
    it('should offer no regions inside it', () =>
        regions([container('template', [], Ownership.Inherited, LayoutArrangement.Column)])
            .some(region => region.containerId === 'template').should.be.false);
});

describe('when the screen itself is a flow', () => {
    const result = regions([leaf('a')], LayoutArrangement.Row);

    it('should offer markers on the screen itself', () =>
        result.filter(region => region.containerId === null && region.kind === DropRegionKind.Between).length.should.equal(2));
});

describe('when the screen is empty', () => {
    it('should still offer a region to drop the first element', () =>
        regions([]).some(region => region.containerId === null && region.isEmptyContainer).should.be.true);
});
