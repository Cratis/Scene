// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Screen } from '@cratis/scene.model';
import { unboundTextOf } from '../unboundText';

const text = (id: string, value: unknown, extra: Record<string, unknown> = {}) => ({ id, componentName: 'core:text', properties: { text: value, ...extra }, slots: {} });

const screens = [
    {
        name: 'Products',
        slotContent: {
            header: [text('featured', 'Featured: 12'), text('heading', 'Products'), text('bound', { kind: 'queryResult', path: 'count' })],
            content: [{ id: 'card', componentName: 'core:card', properties: {}, slots: { body: [text('nested', 'Total 3 items'), text('kept', 'Since 2020', { static: true })] } }],
        },
    },
] as unknown as Screen[];

describe('when finding text bound to nothing', () => {
    const found = unboundTextOf(screens);

    it('should find a literal that carries a figure', () => found.map(entry => entry.elementId).should.include('featured'));
    it('should find one nested inside another component', () => found.map(entry => entry.elementId).should.include('nested'));
    it('should name the screen it is on', () => found.find(entry => entry.elementId === 'featured')?.screen.should.equal('Products'));
    it('should leave a heading with no figure alone', () => found.map(entry => entry.elementId).should.not.include('heading'));
    it('should leave text that is bound alone', () => found.map(entry => entry.elementId).should.not.include('bound'));
    it('should leave text marked as static alone', () => found.map(entry => entry.elementId).should.not.include('kept'));
});
