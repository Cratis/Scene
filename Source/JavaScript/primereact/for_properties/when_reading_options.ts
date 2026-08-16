// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';
import { optionsProperty } from '../properties';

describe('when reading options', () => {
    describe('and the options are written as bare strings', () => {
        const element: SceneElement = { id: 'element', properties: { options: ['Draft', 'Published'] } };

        it('should use each string as both label and value', () => {
            optionsProperty(element, 'options').should.deep.equal([
                { label: 'Draft', value: 'Draft' },
                { label: 'Published', value: 'Published' },
            ]);
        });
    });

    describe('and the options are written as records', () => {
        const element: SceneElement = { id: 'element', properties: { options: [{ label: 'Draft', value: 'draft' }] } };

        it('should keep the label and value apart', () => {
            optionsProperty(element, 'options').should.deep.equal([{ label: 'Draft', value: 'draft' }]);
        });
    });

    describe('and a record carries only a label', () => {
        const element: SceneElement = { id: 'element', properties: { options: [{ label: 'Draft' }] } };

        it('should use the label as the value, which is what the shorthand means', () => {
            optionsProperty(element, 'options').should.deep.equal([{ label: 'Draft', value: 'Draft' }]);
        });
    });

    describe('and an entry carries no usable label', () => {
        const element: SceneElement = { id: 'element', properties: { options: [{ value: 'draft' }, 7, { label: 'Draft' }] } };

        it('should skip it rather than render a blank choice', () => {
            optionsProperty(element, 'options').should.deep.equal([{ label: 'Draft', value: 'Draft' }]);
        });
    });

    describe('and the property is missing', () => {
        const element: SceneElement = { id: 'element', properties: {} };

        it('should return no options', () => {
            optionsProperty(element, 'options').should.deep.equal([]);
        });
    });
});
