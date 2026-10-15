// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { resolvePreviewPlan } from '../resolvePreviewPlan';
import { structure } from '../for_ScenePreviewHost/given';

describe('when resolving a preview target', () => {
    describe('and it is a module', () => {
        const { plan, problems } = resolvePreviewPlan(structure, { module: 'sales' });

        it('should preview the first feature', () => plan!.feature!.should.equal('sales.orders'));
        it('should be a module preview', () => plan!.kind.should.equal('module'));
        it('should name the module and its first feature', () => plan!.breadcrumb.should.deep.equal(['Sales', 'Orders']));
        it('should have no problem', () => problems.should.deep.equal([]));
    });

    describe('and it is a feature, qualified or relative to its module', () => {
        it('should resolve the qualified id', () => resolvePreviewPlan(structure, { module: 'sales', feature: 'sales.customers' }).plan!.breadcrumb.should.deep.equal(['Sales', 'Customers']));
        it('should resolve the relative id', () => resolvePreviewPlan(structure, { module: 'sales', feature: 'customers' }).plan!.feature!.should.equal('sales.customers'));
    });

    describe('and it is a State Change slice', () => {
        const { plan } = resolvePreviewPlan(structure, { slice: 'sales.orders.PlaceOrder' });

        it('should be a state change preview', () => plan!.kind.should.equal('stateChange'));
        it('should be over the page of its feature', () => plan!.feature!.should.equal('sales.orders'));
        it('should carry the command', () => plan!.command!.should.equal('PlaceOrder'));
        it('should name the slice last', () => plan!.breadcrumb.should.deep.equal(['Sales', 'Orders', 'Place order']));
    });

    describe('and it is a State Change slice without a command of its own', () => {
        it('should use the slice id as the command', () => resolvePreviewPlan(structure, { slice: 'sales.customers.Register' }).plan!.command!.should.equal('Register'));
    });

    describe('and it is a State View slice', () => {
        const { plan } = resolvePreviewPlan(structure, { slice: 'sales.orders.OrderList' });

        it('should be a state view preview', () => plan!.kind.should.equal('stateView'));
        it('should not carry a command', () => (plan!.command === undefined).should.equal(true));
    });

    describe('and it is an automation slice', () => {
        const { plan, problems } = resolvePreviewPlan(structure, { slice: 'sales.orders.Reminder' });

        it('should not resolve', () => (plan === undefined).should.equal(true));
        it('should say it is not previewable', () => problems.map(problem => [problem.code, problem.severity, problem.nodeId]).should.deep.equal([['sliceNotPreviewable', 'error', 'sales.orders.Reminder']]));
    });

    describe('and it is not in the structure', () => {
        it('should report an unknown module', () => resolvePreviewPlan(structure, { module: 'nowhere' }).problems[0].code.should.equal('targetNotFound'));
        it('should report an unknown feature', () => resolvePreviewPlan(structure, { module: 'sales', feature: 'ghosts' }).problems[0].code.should.equal('targetNotFound'));
        it('should report an unknown slice', () => resolvePreviewPlan(structure, { slice: 'sales.orders.Ghost' }).problems[0].code.should.equal('targetNotFound'));
        it('should report a module without features', () => resolvePreviewPlan(structure, { module: 'empty' }).problems[0].code.should.equal('moduleWithoutFeatures'));
    });
});
