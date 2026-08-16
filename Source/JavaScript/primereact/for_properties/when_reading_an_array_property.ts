// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';
import { arrayProperty, recordArrayProperty, stringArrayProperty } from '../properties';

describe('when reading an array property', () => {
    const element: SceneElement = {
        id: 'element',
        properties: {
            mixed: ['a', 2, { name: 'c' }, ['d'], undefined],
            notAnArray: 'a',
        },
    };

    describe('and the property is present and an array', () => {
        it('should return every entry untouched', () => {
            arrayProperty(element, 'mixed').should.have.lengthOf(5);
        });

        it('should keep only the strings when strings were asked for', () => {
            stringArrayProperty(element, 'mixed').should.deep.equal(['a']);
        });

        it('should keep only the objects when objects were asked for, excluding arrays', () => {
            recordArrayProperty(element, 'mixed').should.deep.equal([{ name: 'c' }]);
        });
    });

    describe('and the property is missing', () => {
        it('should return an empty array rather than undefined, because every caller maps over it', () => {
            arrayProperty(element, 'absent').should.deep.equal([]);
        });
    });

    describe('and the property is present but not an array', () => {
        it('should treat it exactly like a missing one', () => {
            arrayProperty(element, 'notAnArray').should.deep.equal([]);
        });
    });
});
