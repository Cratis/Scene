// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ElementRect, findSceneElementRect } from '../useElementRect';

function fakeBounds(left: number, top: number, width: number, height: number): DOMRect {
    return { left, top, width, height } as DOMRect;
}

function fakeElement(bounds: DOMRect): HTMLElement {
    return { getBoundingClientRect: () => bounds } as HTMLElement;
}

describe('when the element exists', () => {
    let result: ElementRect | undefined;

    beforeEach(() => {
        const target = fakeElement(fakeBounds(30, 40, 200, 80));
        const container = {
            getBoundingClientRect: () => fakeBounds(10, 10, 500, 500),
            querySelector: () => target,
        } as unknown as HTMLElement;

        result = findSceneElementRect(container, 'sidebar');
    });

    it('should position the rect relative to the container', () => {
        result!.left.should.equal(20);
        result!.top.should.equal(30);
    });

    it('should keep the element\'s own size', () => {
        result!.width.should.equal(200);
        result!.height.should.equal(80);
    });
});
