// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Opens, OutletSubject, ScreenFit, SlotRole } from '@cratis/scene.model';
import { EnablementOutcome, EnablementState } from '@cratis/scene.engine';
import type { StateChangeSlice } from '../../Actions/StateChangeSlice';
import { inspectHook, placementInputsOf, type PlacementEnvironment } from '../hookPlacement';

const setPrice: StateChangeSlice = {
    id: 'slice-price', name: 'SetPrice', commandName: 'SetPrice', origin: ['Shop', 'Orders'], fits: [ScreenFit.Pane, ScreenFit.Dialog],
    inputs: [{ name: 'orderId', type: 'Guid', required: true }, { name: 'price', type: 'number', required: true }],
};
const withdraw: StateChangeSlice = { id: 'slice-withdraw', name: 'Withdraw', commandName: 'Withdraw', origin: ['Shop'], inputs: [{ name: 'orderId', type: 'Guid', required: true }], screenless: true };

const environment = (): PlacementEnvironment => ({
    slices: [setPrice, withdraw],
    slots: [{ name: 'content', role: SlotRole.Page, filled: true, routed: false, routedBy: [] }, { name: 'detail', role: SlotRole.Pane, filled: false, routed: true, routedBy: ['orderId'] }],
    itemFields: new Set(['orderId']),
    routeParameters: [],
});

describe('when a hook acts on an item and the slice needs a value the item does not have', () => {
    const inputs = placementInputsOf(setPrice, { slice: setPrice.id, subject: OutletSubject.Item }, environment());
    const inspection = inspectHook({ slice: setPrice.id, subject: OutletSubject.Item, opens: Opens.None }, environment());

    it('should take the input the item has from the item', () => (inputs.find(input => input.name === 'orderId')?.source !== undefined).should.be.true);
    it('should leave the input nothing supplies without a source', () => (inputs.find(input => input.name === 'price')?.source === undefined).should.be.true);
    it('should not allow it to run directly', () => inspection.placement!.runDirectly.available.should.be.false);
    it('should say which input has no source', () => inspection.placement!.runDirectly.missing.should.deep.equal(['price']));
    it('should say why in a sentence', () => inspection.placement!.runDirectly.reason.should.contain('price'));
});

describe('when a hook says nothing about where its slice opens', () => {
    const inspection = inspectHook({ slice: setPrice.id, subject: OutletSubject.Item }, environment());

    it('should resolve to a place', () => (inspection.placement!.resolved !== undefined).should.be.true);
    it('should explain what it resolved to', () => inspection.placement!.reason.length.should.be.greaterThan(0));
    it('should offer the slot of the page that is free', () => inspection.placement!.slots.some(slot => slot.name === 'detail' && slot.offered).should.be.true);
    it('should not offer the slot the page fills', () => inspection.placement!.slots.some(slot => slot.name === 'content' && slot.offered).should.be.false);
    it('should not be screenless', () => inspection.screenless.should.be.false);
});

describe('when a hook runs a slice that has no screen', () => {
    const inspection = inspectHook({ slice: withdraw.id, subject: OutletSubject.Item }, environment());

    it('should be screenless', () => inspection.screenless.should.be.true);
    it('should run directly when the item has what it needs', () => inspection.placement!.resolved!.should.equal(Opens.None));
});

describe('when a hook maps its inputs itself', () => {
    const inputs = placementInputsOf(setPrice, { slice: setPrice.id, mapping: { orderId: 'row.id', price: '' } }, environment());

    it('should believe the mapped input', () => (inputs.find(input => input.name === 'orderId')?.source !== undefined).should.be.true);
    it('should leave the unmapped one without a source', () => (inputs.find(input => input.name === 'price')?.source === undefined).should.be.true);
});

describe('when the enablement of a hook for an item is worked out', () => {
    const enablement = inspectHook({ slice: setPrice.id, subject: OutletSubject.Item, enabledWhen: 'item.status == "onSale"' }, environment()).enablement;

    it('should check the subject', () => enablement.steps.some(step => step.check === 'subject').should.be.true);
    it('should not be decided while no item is selected', () => enablement.state.should.not.equal(EnablementState.Enabled));
    it('should say why in words', () => enablement.reason.length.should.be.greaterThan(0));
    it('should leave the condition unchecked while there is no item to compare', () => enablement.steps.find(step => step.check === 'condition')!.outcome.should.not.equal(EnablementOutcome.Passed));
});

describe('when a hook names no slice', () => {
    const inspection = inspectHook({ subject: OutletSubject.Screen }, environment());

    it('should have no placement', () => (inspection.placement === undefined).should.be.true);
    it('should still say it is enabled', () => inspection.enablement.state.should.equal(EnablementState.Enabled));
});
