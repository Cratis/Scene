// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';
import { booleanProperty } from '../properties';

describe('when reading a boolean property', () => {
    const element: SceneElement = { id: 'element', properties: { disabled: true, visible: false, filter: 'yes' } };

    describe('and the property is present and a boolean', () => {
        it('should return true when it is true', () => {
            booleanProperty(element, 'disabled', false).should.be.true;
        });

        it('should return false when it is false rather than falling back', () => {
            booleanProperty(element, 'visible', true).should.be.false;
        });
    });

    describe('and the property is missing', () => {
        it('should return undefined when no fallback was given', () => {
            (booleanProperty(element, 'rounded') === undefined).should.be.true;
        });

        it('should return the fallback when one was given', () => {
            booleanProperty(element, 'rounded', true).should.be.true;
        });
    });

    describe('and the property is present but not a boolean', () => {
        it('should treat a truthy string like a missing property', () => {
            booleanProperty(element, 'filter', false).should.be.false;
        });
    });
});
