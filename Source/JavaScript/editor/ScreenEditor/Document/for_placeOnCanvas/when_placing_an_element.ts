// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneElement } from '@cratis/scene.model';
import { createExternalComponent } from '../createExternalComponent';
import { placeOnCanvas } from '../placeOnCanvas';

type Placed = SceneElement & { properties: Record<string, number | string | undefined> };
const element = () => createExternalComponent('a', 'a', 'text', { text: 'Hello' }) as unknown as Placed;

describe('when placing an element on a canvas', () => {
    const placed = placeOnCanvas(element(), { left: 40.4, top: 99.6 }) as Placed;

    it('should set its left in whole pixels', () => (placed.properties['Canvas.Left'] as number).should.equal(40));
    it('should set its top in whole pixels', () => (placed.properties['Canvas.Top'] as number).should.equal(100));
    it('should keep what it already had', () => (placed.properties.text as string).should.equal('Hello'));
    it('should leave the element it was given alone', () => (element().properties['Canvas.Left'] === undefined).should.be.true);
});

describe('when placing an element left of the canvas', () => {
    it('should keep it on the canvas', () => ((placeOnCanvas(element(), { left: -30, top: -5 }) as Placed).properties['Canvas.Left'] as number).should.equal(0));
});
