// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneElement } from '@cratis/scene.model';
import { createExternalComponent } from '../createExternalComponent';
import { placeOnCanvas, placementOf, removePlacement } from '../placeOnCanvas';

type Bag = SceneElement & { properties: Record<string, unknown> };
const placed = () => placeOnCanvas(createExternalComponent('a', 'a', 'text', { text: 'Hello' }) as unknown as Bag, { left: 10, top: 20 });

describe('when reading where an element is on a canvas', () => {
    it('should give its position', () => placementOf(placed())!.should.deep.equal({ left: 10, top: 20 }));
    it('should give nothing for an element that has none', () => (placementOf(createExternalComponent('a', 'a', 'text', {}) as unknown as Bag) === undefined).should.be.true);
});

describe('when taking an element off a canvas', () => {
    const left = removePlacement(placed());

    it('should drop its left', () => ('Canvas.Left' in left.properties).should.be.false);
    it('should drop its top', () => ('Canvas.Top' in left.properties).should.be.false);
    it('should keep the rest of what it had', () => left.properties.text!.should.equal('Hello'));
    it('should leave the element it was given alone', () => { const original = placed(); removePlacement(original); (original.properties['Canvas.Left'] as number).should.equal(10); });
});
