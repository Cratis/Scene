// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { createDryRunInvoker, DryRunInvocation } from '../slices/createDryRunInvoker';
import { OrdersApplication } from './given';

describe('when dry running a slice', () => {
    afterEach(cleanup);

    describe('and the dialog is submitted', () => {
        let invoked: DryRunInvocation[];
        let commands: unknown[];
        const onCommand = (event: Event) => commands.push((event as CustomEvent).detail);

        beforeEach(async () => {
            invoked = [];
            commands = [];
            globalThis.addEventListener('cratis.scene.command', onCommand);
            render(<OrdersApplication invoker={createDryRunInvoker({ onInvoked: invocation => invoked.push(invocation) })} />);
            const button = screen.getByRole('button', { name: 'New order' });
            button.focus();
            fireEvent.click(button);
            fireEvent.change(screen.getByLabelText('Customer', { exact: false }), { target: { value: 'Fjordline AS' } });
            await act(async () => { fireEvent.click(document.querySelector('.scene-slice-dialog-submit')!); });
        });

        afterEach(() => globalThis.removeEventListener('cratis.scene.command', onCommand));

        it('should report the would-be payload', () =>
            invoked.map(invocation => [invocation.sliceId, invocation.command, invocation.payload.customer]).should.deep.equal([['sales.orders.PlaceOrder', 'PlaceOrder', 'Fjordline AS']]));
        it('should send nothing', () => commands.length.should.equal(0));
        it('should close the dialog', () => (screen.queryByRole('dialog') === null).should.equal(true));
    });

    describe('and the invoker is called directly', () => {
        it('should carry the payload and say it was a dry run', async () => {
            const result = await createDryRunInvoker().invoke('sales.orders.PlaceOrder', { customer: 'A' }, 'PlaceOrder');
            [result.succeeded, result.dryRun, result.payload, result.message].should.deep.equal([true, true, { customer: 'A' }, 'Dry run: PlaceOrder was not sent.']);
        });

        it('should fail on a validation problem without reporting an invocation', async () => {
            const invoked: DryRunInvocation[] = [];
            const invoker = createDryRunInvoker({ onInvoked: invocation => invoked.push(invocation), validate: () => [{ field: 'customer', message: 'Unknown customer.' }] });
            const result = await invoker.invoke('sales.orders.PlaceOrder', { customer: 'A' });
            [result.succeeded, result.validationErrors, invoked.length].should.deep.equal([false, [{ field: 'customer', message: 'Unknown customer.' }], 0]);
        });
    });
});
