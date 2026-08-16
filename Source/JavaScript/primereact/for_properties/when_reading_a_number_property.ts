// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';
import { numberProperty } from '../properties';

describe('when reading a number property', () => {
    const element: SceneElement = { id: 'element', properties: { rows: 5, zero: 0, size: '12', broken: Number.NaN } };

    describe('and the property is present and a number', () => {
        it('should return it', () => {
            numberProperty(element, 'rows', 1).should.equal(5);
        });

        it('should return zero rather than falling back', () => {
            numberProperty(element, 'zero', 10).should.equal(0);
        });
    });

    describe('and the property is missing', () => {
        it('should return undefined when no fallback was given', () => {
            (numberProperty(element, 'columns') === undefined).should.be.true;
        });

        it('should return the fallback when one was given', () => {
            numberProperty(element, 'columns', 2).should.equal(2);
        });
    });

    describe('and the property is present but not a usable number', () => {
        it('should treat a numeric string like a missing property', () => {
            numberProperty(element, 'size', 16).should.equal(16);
        });

        it('should treat NaN like a missing property, because it is never a usable size', () => {
            numberProperty(element, 'broken', 16).should.equal(16);
        });
    });
});
