// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';
import { stringProperty } from '../properties';

describe('when reading a string property', () => {
    const element: SceneElement = { id: 'element', properties: { label: 'Save', count: 3 } };

    describe('and the property is present and a string', () => {
        it('should return it', () => {
            stringProperty(element, 'label')!.should.equal('Save');
        });
    });

    describe('and the property is missing', () => {
        it('should return undefined when no fallback was given', () => {
            (stringProperty(element, 'placeholder') === undefined).should.be.true;
        });

        it('should return the fallback when one was given', () => {
            stringProperty(element, 'placeholder', 'Type here').should.equal('Type here');
        });
    });

    describe('and the property is present but not a string', () => {
        it('should treat it exactly like a missing one', () => {
            stringProperty(element, 'count', 'none').should.equal('none');
        });
    });
});
