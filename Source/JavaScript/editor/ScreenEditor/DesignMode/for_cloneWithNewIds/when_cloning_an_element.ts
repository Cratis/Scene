// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createExternalComponent } from '../../Document/createExternalComponent';
import { cloneWithNewIds } from '../cloneWithNewIds';

let counter = 0;
const newId = () => `copy-${++counter}`;
const original = createExternalComponent('card', 'Card', 'core:card', { title: 'Orders', id: 'not-an-element-id' }, { body: [createExternalComponent('inner', 'Inner', 'core:text', { text: 'x' })] });
const copy = cloneWithNewIds(original, newId) as unknown as { id: string; properties: Record<string, unknown>; slots: Record<string, { id: string }[]> };

describe('when cloning an element with something inside it', () => {
    it('should give the copy an identity of its own', () => copy.id.should.not.equal('card'));
    it('should give what is inside an identity of its own too', () => copy.slots.body[0].id.should.not.equal('inner'));
    it('should keep what the element holds', () => copy.properties.title!.should.equal('Orders'));
    it('should not mistake a property called id for an identity', () => copy.properties.id!.should.equal('not-an-element-id'));
    it('should leave the original as it was', () => { (original as { id: string }).id.should.equal('card'); (original as unknown as { slots: Record<string, { id: string }[]> }).slots.body[0].id.should.equal('inner'); });
});
