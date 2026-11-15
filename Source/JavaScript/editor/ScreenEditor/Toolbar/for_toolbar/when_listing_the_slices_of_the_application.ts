// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { slicesOfStructure } from '../slicesOfStructure';
import { application } from './given_a_toolbar_and_an_application';

const slices = slicesOfStructure(application);

describe('when listing the slices of the application', () => {
    it('should list the slices of every module and feature, whatever their kind', () => slices.map(slice => slice.name).should.have.members(['Onboard', 'PlaceOrder', 'CancelOrder', 'OrderSummary', 'SendReminder', 'Refund', 'AssignTicket', 'OpenTicketsView']));
    it('should give each its qualified id, the one Scene resolves', () => slices.find(slice => slice.name === 'PlaceOrder')!.id.should.equal('sales.orders.PlaceOrder'));
    it('should give a slice of a nested feature the whole path', () => slices.find(slice => slice.name === 'Refund')!.id.should.equal('sales.orders.returns.Refund'));
    it('should give a slice that sits in a module itself the module as its id prefix', () => slices.find(slice => slice.name === 'Onboard')!.id.should.equal('sales.Onboard'));
    it('should name the modules and features it sits in, outermost first', () => { slices.find(slice => slice.name === 'PlaceOrder')!.path.should.deep.equal(['Sales', 'Orders']); slices.find(slice => slice.name === 'Refund')!.path.should.deep.equal(['Sales', 'Orders', 'Returns']); });
    it('should carry the kind', () => slices.find(slice => slice.name === 'OrderSummary')!.kind.should.equal('StateView'));
    it('should list nothing for an application it does not know', () => slicesOfStructure(undefined).should.be.empty);
});
