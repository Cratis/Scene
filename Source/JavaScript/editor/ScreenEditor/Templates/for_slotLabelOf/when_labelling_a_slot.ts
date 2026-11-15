// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SlotRole, type ScreenTemplate } from '@cratis/scene.model';
import { slotLabelOf } from '../slotSections';

const template = {
    name: 'ListPage',
    slots: [
        { name: 'content', role: SlotRole.Page, routed: true, primary: true },
        { name: 'detail', role: SlotRole.Pane, routed: true, routedBy: ['sku'], optional: true },
        { name: 'header' },
    ],
} as ScreenTemplate;

describe('when labelling the slots of a template', () => {
    it('should say a primary routed slot\'s role', () => slotLabelOf(template, 'content').should.equal('slot: content · page · routed · primary'));
    it('should say what routes a slot', () => slotLabelOf(template, 'detail').should.equal('slot: detail · pane · routed by sku · optional'));
    it('should say only the name of a plain slot', () => slotLabelOf(template, 'header').should.equal('slot: header'));
});
