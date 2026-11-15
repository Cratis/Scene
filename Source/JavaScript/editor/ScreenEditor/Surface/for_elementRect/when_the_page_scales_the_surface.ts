// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { inSurfacePixels, nodeRect, surfaceOrigin } from '../elementRect';

const box = (left: number, top: number, width: number, height: number) => ({ left, top, width, height, right: left + width, bottom: top + height });
const node = (rect: ReturnType<typeof box>, children: unknown[] = []) => ({ getBoundingClientRect: () => rect, children } as unknown as Element);
const surface = (rect: ReturnType<typeof box>, offsetWidth: number, offsetHeight: number) => ({ getBoundingClientRect: () => rect, offsetWidth, offsetHeight } as unknown as HTMLElement);

// The surface is 900 x 400 in its own pixels, 100 px from the left and 50 from the top of the page; the item sits 40 right and 20 below its corner.
describe('when the surface is not scaled', () => {
    const origin = surfaceOrigin(surface(box(100, 50, 900, 400), 900, 400));
    it('should have a scale of one', () => { origin.scaleX!.should.equal(1); origin.scaleY!.should.equal(1); });
    it('should measure an item in the surface pixels it was drawn in', () => {
        const rect = nodeRect(node(box(140, 70, 80, 30)), origin)!;
        [rect.left, rect.top, rect.width, rect.height].should.deep.equal([40, 20, 80, 30]);
    });
});

describe('when the page scales the surface to half', () => {
    const origin = surfaceOrigin(surface(box(100, 50, 450, 200), 900, 400));
    it('should know the scale', () => { origin.scaleX!.should.equal(0.5); origin.scaleY!.should.equal(0.5); });
    it('should keep the surface size in its own pixels', () => { origin.width.should.equal(900); origin.height.should.equal(400); });
    it('should measure an item in the surface pixels, not in the pixels of the page', () => {
        const rect = nodeRect(node(box(120, 60, 40, 15)), origin)!;
        [rect.left, rect.top, rect.width, rect.height].should.deep.equal([40, 20, 80, 30]);
    });
    it('should measure what a wrapper without a box of its own holds', () => {
        const rect = nodeRect(node(box(0, 0, 0, 0), [node(box(120, 60, 40, 15)), node(box(180, 100, 20, 10))]), origin)!;
        [rect.left, rect.top, rect.width, rect.height].should.deep.equal([40, 20, 160, 100]);
    });
});

describe('when the page scales the surface to double', () => {
    const origin = surfaceOrigin(surface(box(100, 50, 1800, 800), 900, 400));
    it('should measure an item in the surface pixels', () => {
        const rect = inSurfacePixels(box(180, 90, 160, 60), origin);
        [rect.left, rect.top, rect.width, rect.height].should.deep.equal([40, 20, 80, 30]);
    });
});
