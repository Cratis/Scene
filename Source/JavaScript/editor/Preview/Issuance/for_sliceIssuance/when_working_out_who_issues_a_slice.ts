// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Opens, ScreenFit, SliceKind } from '@cratis/scene.model';
import { sliceIssuanceOf } from '../sliceIssuance';
import type { PreviewScene } from '../../PreviewScene';

const scene = {
    layouts: [{
        name: 'Plain', slots: [{ name: 'content' }],
        outlets: [{
            name: 'toolbar', kind: 'actions',
            defaults: [
                { kind: 'button', id: 'price', title: 'Set price', slice: 'Shop.Orders.SetPrice', opens: Opens.Drawer },
                { kind: 'button', id: 'archive', title: 'Archive', slice: 'Shop.Orders.Archive', opens: Opens.None },
            ],
        }],
    }],
    screenTemplates: [],
    dialogTemplates: [],
    screens: [
        { name: 'Orders', layout: 'Plain', path: ['Shop', 'Orders'], owner: 'Shop.Orders.Overview', forms: [], contributions: [], slotContent: { content: [{ id: 'orders-toolbar', componentName: 'core:outletItems', properties: { name: 'toolbar' }, slots: {} }] } },
        { name: 'SetPrice', layout: 'Plain', owner: 'Shop.Orders.SetPrice', fits: [ScreenFit.Drawer, ScreenFit.Dialog], forms: [], contributions: [], slotContent: { content: [] } },
    ],
    structure: {
        modules: [{
            id: 'Shop', name: 'Shop', slices: [], features: [{
                id: 'Orders', name: 'Orders', features: [], slices: [
                    { id: 'SetPrice', name: 'SetPrice', kind: SliceKind.StateChange, command: 'SetPrice' },
                    { id: 'Archive', name: 'Archive', kind: SliceKind.StateChange, command: 'Archive' },
                    { id: 'Forgotten', name: 'Forgotten', kind: SliceKind.StateChange, command: 'Forgotten' },
                    { id: 'Overview', name: 'Overview', kind: SliceKind.StateView },
                ],
            }],
        }],
    },
    commandSchemas: { SetPrice: '{"properties":{"sku":{},"price":{}}}', Archive: '{"properties":{"sku":{}}}', Forgotten: '{"properties":{"sku":{}}}' },
} as unknown as PreviewScene;

describe('when working out who issues a slice', () => {
    const issuance = sliceIssuanceOf(scene);
    const price = issuance.get('Shop.Orders.SetPrice')!;
    const archive = issuance.get('Shop.Orders.Archive')!;
    const forgotten = issuance.get('Shop.Orders.Forgotten')!;

    it('should know only the State Change slices', () => [...issuance.keys()].sort().should.deep.equal(['Shop.Orders.Archive', 'Shop.Orders.Forgotten', 'Shop.Orders.SetPrice']));
    it('should say a slice with a screen of its own has one', () => price.screenless.should.be.false);
    it('should keep what that screen fits', () => price.fits.should.deep.equal([ScreenFit.Drawer, ScreenFit.Dialog]));
    it('should say where the hook that opens it puts it', () => price.opens?.should.equal(Opens.Drawer));
    it('should list the screen, outlet and button that issue it', () => price.issuedFrom.map(hook => `${hook.screen} > ${hook.outlet} > ${hook.button}`).should.deep.equal(['Orders > toolbar > Set price']));
    it('should name the element that draws the outlet, for the editor to select', () => price.issuedFrom[0].outletElementId?.should.equal('orders-toolbar'));
    it('should say a slice with no screen has none', () => archive.screenless.should.be.true);
    it('should list the hook that runs a slice directly', () => archive.issuedFrom[0].opens?.should.equal(Opens.None));
    it('should say a directly run slice opens nowhere', () => (archive.opens === undefined).should.be.true);
    it('should say a slice nobody issues is issued from nowhere', () => forgotten.issuedFrom.length.should.equal(0));
});
