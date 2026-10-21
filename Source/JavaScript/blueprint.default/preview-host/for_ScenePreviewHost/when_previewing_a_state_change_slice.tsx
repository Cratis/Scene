// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { PreviewInvocation } from '../PreviewToast';
import { nordicPack, otherPack } from './given';
import { preview } from './when_previewing_a_module';

const dialog = () => screen.queryByRole('dialog');
const field = (label: string) => screen.getByLabelText(label, { exact: false }) as HTMLInputElement;
const submit = async () => { await act(async () => { fireEvent.click(document.querySelector('.scene-slice-dialog-submit')!); }); };

describe('when previewing a State Change slice', () => {
    afterEach(cleanup);

    describe('and the feature has a page the slice does not own', () => {
        let invocations: PreviewInvocation[];
        let breadcrumbs: string[][];
        beforeEach(() => {
            invocations = [];
            breadcrumbs = [];
            render(preview({ target: { slice: 'sales.orders.PlaceOrder' }, onInvoked: invocation => invocations.push(invocation), onBreadcrumbChange: breadcrumb => breadcrumbs.push(breadcrumb) }));
        });

        it('should open the task dialog of the slice and draw nothing of the page of the feature behind it', () => [dialog()!.getAttribute('aria-label'), document.querySelector('[data-page="orders"]'), document.querySelector('.layout-topbar')].should.deep.equal(['Place order', null, null]));
        it('should derive the dialog from the slice', () => [screen.getByRole('heading', { name: 'Place order' }).textContent, document.querySelector('.scene-slice-dialog-subtitle')!.textContent].should.deep.equal(['Place order', 'State Change · PlaceOrder']));
        it('should fill the fields from the active sample data pack', () => [field('Customer').value, field('Product').value, field('Quantity').value].should.deep.equal(['Fjordline AS', 'Scanner', '4']));
        it('should report the slice in the breadcrumb', () => breadcrumbs.should.deep.equal([['Sales', 'Orders', 'Place order']]));
        it('should have a Cancel button and a button titled like the slice', () => [screen.getByRole('button', { name: 'Cancel' }).textContent, document.querySelector('.scene-slice-dialog-submit')!.textContent].should.deep.equal(['Cancel', 'Place order']));

        describe('and it is submitted', () => {
            beforeEach(submit);

            it('should only validate and report what would be sent', () => invocations.map(invocation => [invocation.sliceId, invocation.command, invocation.payload]).should.deep.equal([['sales.orders.PlaceOrder', 'PlaceOrder', { customer: 'Fjordline AS', product: 'Scanner', quantity: 4 }]]));
            it('should confirm that the command would be sent', () => screen.getByRole('status').textContent!.should.contain('Command would be sent'));
            it('should show the payload in an expandable detail', () => document.querySelector('[data-scene-preview-toast] details pre')!.textContent!.should.contain('"customer": "Fjordline AS"'));
            it('should close the dialog', () => (dialog() === null).should.equal(true));
        });

        describe('and a required field is emptied before submitting', () => {
            beforeEach(async () => {
                fireEvent.change(field('Customer'), { target: { value: '' } });
                await submit();
            });

            it('should validate and send nothing', () => [invocations.length, screen.getByRole('alert').textContent].should.deep.equal([0, 'Customer is required.']));
            it('should keep the dialog open', () => (dialog() !== null).should.equal(true));
        });

        describe('and it is cancelled', () => {
            beforeEach(() => { fireEvent.click(screen.getByRole('button', { name: 'Cancel' })); });

            it('should close the dialog and leave an empty neutral page', () => [dialog(), document.querySelector('[data-scene-preview-surface="task-dialog"]') !== null, document.querySelector('[data-page]')].should.deep.equal([null, true, null]));
        });
    });

    describe('and the feature has no page of its own', () => {
        it('should open the dialog over a neutral backdrop', () => {
            const document = preview().props.children.props.document;
            render(preview({ document: { ...document, screens: document.screens.filter((candidate: { name: string }) => candidate.name !== 'sales.orders') }, target: { slice: 'sales.orders.PlaceOrder' } }));
            [dialog()!.getAttribute('aria-label'), globalThis.document.querySelector('.layout-topbar'), globalThis.document.querySelector('[data-scene-preview-surface="task-dialog"]') !== null].should.deep.equal(['Place order', null, true]);
        });
    });

    describe('and the pack is overridden for the session', () => {
        it('should fill the fields from the pack the strip selected', () => {
            render(preview({ target: { slice: 'sales.orders.PlaceOrder' }, sampleData: { packs: [nordicPack, otherPack], sessionActivePack: 'other' } }));
            [field('Customer').value, field('Product').value].should.deep.equal(['Northwind', 'Printer']);
        });
    });

    describe('and the profile selects the pack', () => {
        it('should fill the fields from the profile pack', () => {
            const document = preview().props.children.props.document;
            render(preview({ document: { ...document, uiProfiles: [{ ...document.uiProfiles[0], sampleData: { activePack: 'other', mappings: [], bindings: [] } }] }, target: { slice: 'sales.orders.PlaceOrder' }, sampleData: { packs: [nordicPack, otherPack] } }));
            field('Customer').value.should.equal('Northwind');
        });
    });

    describe('and a real invoker is given', () => {
        it('should submit through it and show no dry-run toast', async () => {
            const calls: unknown[] = [];
            render(preview({ target: { slice: 'sales.orders.PlaceOrder' }, invoker: { invoke: async (slice, payload, command) => { calls.push([slice, command, payload]); return { succeeded: true }; } } }));
            await submit();
            [calls.length, screen.queryByRole('status')].should.deep.equal([1, null]);
        });
    });
});
