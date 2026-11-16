// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenFit, SliceKind } from '@cratis/scene.model';
import { actionSlicesOf, outletsValueOf, screenOfElement } from '../previewOutlets';
import type { PreviewScene } from '../PreviewScene';

const scene = {
    layouts: [{ name: 'Plain', slots: [{ name: 'content' }] }],
    screenTemplates: [],
    dialogTemplates: [],
    screens: [
        { name: 'Orders', layout: 'Plain', path: ['Shop', 'Orders'], forms: [], contributions: [], slotContent: { content: [{ id: 'toolbar', properties: {}, slots: {} }] } },
        { name: 'SetPrice', layout: 'Plain', owner: 'Shop.Orders.SetPrice', fits: [ScreenFit.Drawer], forms: [], contributions: [], slotContent: { content: [] } },
    ],
    structure: {
        modules: [{
            id: 'Shop', name: 'Shop', slices: [], features: [{
                id: 'Orders', name: 'Orders', features: [], slices: [
                    { id: 'SetPrice', name: 'SetPrice', kind: SliceKind.StateChange, command: 'SetPrice' },
                    { id: 'Archive', name: 'Archive', kind: SliceKind.StateChange, command: 'Archive' },
                    { id: 'Overview', name: 'Overview', kind: SliceKind.StateView },
                ],
            }],
        }],
    },
    commandSchemas: { SetPrice: '{"properties":{"sku":{},"price":{}}}', Archive: '{"properties":{"sku":{}}}' },
} as unknown as PreviewScene;

describe('when the slices a hook of a preview can run are worked out', () => {
    const slices = actionSlicesOf(scene);
    const named = (id: string) => slices.find(slice => slice.id === id);

    it('should list only the State Change slices, by their dotted name', () => slices.map(slice => slice.id).should.deep.equal(['Shop.Orders.SetPrice', 'Shop.Orders.Archive']));
    it('should give the slice the screen it owns', () => named('Shop.Orders.SetPrice')!.screen!.should.equal('SetPrice'));
    it('should give the slice what its screen fits', () => named('Shop.Orders.SetPrice')!.fits!.should.deep.equal([ScreenFit.Drawer]));
    it('should leave a slice with no screen without one', () => (named('Shop.Orders.Archive')!.screen === undefined).should.be.true);
    it('should take the inputs from the command', () => named('Shop.Orders.SetPrice')!.inputs.map(input => input.name).should.deep.equal(['sku', 'price']));
});

describe('when the slices a hook can run are worked out with what their commands ask', () => {
    const authorizations = new Map<string, readonly string[]>([['Shop.Orders.SetPrice', ['Admin']]]);
    const slices = actionSlicesOf(scene, authorizations);
    it('should give the slice the policy its command authorizes with', () => slices.find(slice => slice.id === 'Shop.Orders.SetPrice')!.authorize!.should.equal('Admin'));
    it('should leave a command nothing asks of open', () => (slices.find(slice => slice.id === 'Shop.Orders.Archive')!.authorize === undefined).should.be.true);
    it('should hand the persona to what the outlets resolve against', () => outletsValueOf(scene, 'toolbar', { persona: { name: 'Viewer', policies: [] }, authorizations })!.persona!.name.should.equal('Viewer'));
    it('should resolve against nobody when no persona is chosen', () => (outletsValueOf(scene, 'toolbar')!.persona === undefined).should.be.true);
});

describe('when the page an outlet is on is found', () => {
    it('should find the screen that draws the element', () => screenOfElement(scene.screens, 'toolbar')!.name.should.equal('Orders'));
    it('should find none for an element no screen draws', () => (screenOfElement(scene.screens, 'elsewhere') === undefined).should.be.true);
    it('should resolve the outlets against the slices and the slots of that page', () => {
        const value = outletsValueOf(scene, 'toolbar')!;
        value.slices!.length.should.equal(2);
        value.slots!.map(slot => slot.name).should.deep.equal(['content']);
    });
    it('should resolve nothing for an element that is on no page', () => (outletsValueOf(scene, 'elsewhere') === undefined).should.be.true);
});
