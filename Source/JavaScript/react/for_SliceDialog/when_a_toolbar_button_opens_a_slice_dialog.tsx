// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach } from 'vitest';
import { InvocationResult } from '../slices/InvocationResult';
import { SliceInvoker } from '../slices/SliceInvoker';
import { OrdersApplication } from './given';

interface Call { sliceId: string; payload: Record<string, unknown>; command?: string }

function fakeInvoker(result: InvocationResult = { succeeded: true }): SliceInvoker & { calls: Call[] } {
    const calls: Call[] = [];
    return { calls, invoke: async (sliceId, payload, command) => { calls.push({ sliceId, payload, command }); return result; } };
}

const open = (name = 'New order') => {
    const button = screen.getByRole('button', { name });
    button.focus();
    fireEvent.click(button);
    return button;
};
const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label, { exact: false }), { target: { value } });
const dialog = () => screen.queryByRole('dialog');

describe('when a toolbar button opens a slice as a task dialog', () => {
    afterEach(cleanup);

    describe('and the button is clicked', () => {
        beforeEach(() => {
            render(<OrdersApplication invoker={fakeInvoker()} />);
            open();
        });

        it('should open a modal dialog named by the button title', () =>
            [dialog()!.getAttribute('aria-modal'), dialog()!.getAttribute('aria-label')].should.deep.equal(['true', 'New order']));
        it('should show the title and the slice as the subtitle', () =>
            [screen.getByRole('heading', { name: 'New order' }).textContent, document.querySelector('.scene-slice-dialog-subtitle')!.textContent].should.deep.equal(['New order', 'State Change · PlaceOrder']));
        it('should show a labelled field for each command property', () =>
            Array.from(document.querySelectorAll('.scene-slice-dialog-field label')).map(label => label.textContent).should.deep.equal(['Customer *', 'Product', 'Quantity', 'Express delivery']));
        it('should focus the first field', () => document.activeElement!.getAttribute('name')!.should.equal('customer'));
        it('should offer Cancel and a submit button labelled with the title', () =>
            Array.from(document.querySelectorAll('.scene-slice-dialog-footer button')).map(candidate => candidate.textContent).should.deep.equal(['Cancel', 'New order']));
    });

    describe('and the dialog is submitted through the invoker in scope', () => {
        let invoker: ReturnType<typeof fakeInvoker>;

        beforeEach(async () => {
            invoker = fakeInvoker();
            render(<OrdersApplication invoker={invoker} />);
            open();
            type('Customer', 'Fjordline AS');
            type('Product', 'Scanner');
            type('Quantity', '12');
            fireEvent.click(screen.getByLabelText('Express delivery'));
            await act(async () => { fireEvent.click(document.querySelector('.scene-slice-dialog-submit')!); });
        });

        it('should invoke the slice with the typed payload and its command', () =>
            invoker.calls.should.deep.equal([{ sliceId: 'sales.orders.PlaceOrder', command: 'PlaceOrder', payload: { customer: 'Fjordline AS', product: 'Scanner', quantity: 12, express: true } }]));
        it('should close the dialog on success', () => (dialog() === null).should.equal(true));
    });

    describe('and the dialog is cancelled', () => {
        let invoker: ReturnType<typeof fakeInvoker>;
        let button: HTMLElement;

        beforeEach(() => {
            invoker = fakeInvoker();
            render(<OrdersApplication invoker={invoker} />);
            button = open();
            fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        });

        it('should close it without invoking', () => [dialog() === null, invoker.calls.length].should.deep.equal([true, 0]));
        it('should return focus to the button that opened it', () => (document.activeElement === button).should.equal(true));
    });

    describe('and Escape is pressed', () => {
        let button: HTMLElement;

        beforeEach(() => {
            render(<OrdersApplication invoker={fakeInvoker()} />);
            button = open();
            fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
        });

        it('should close the dialog', () => (dialog() === null).should.equal(true));
        it('should return focus to the button', () => (document.activeElement === button).should.equal(true));
    });

    describe('and Tab leaves the last control', () => {
        it('should wrap to the first', () => {
            render(<OrdersApplication invoker={fakeInvoker()} />);
            open();
            const submit = document.querySelector<HTMLElement>('.scene-slice-dialog-submit')!;
            submit.focus();
            fireEvent.keyDown(submit, { key: 'Tab' });
            document.activeElement!.getAttribute('name')!.should.equal('customer');
        });

        it('should wrap backwards from the first to the last', () => {
            render(<OrdersApplication invoker={fakeInvoker()} />);
            open();
            fireEvent.keyDown(document.activeElement!, { key: 'Tab', shiftKey: true });
            (document.activeElement as HTMLElement).className.should.equal('scene-slice-dialog-submit');
        });
    });

    describe('and a required field is empty', () => {
        let invoker: ReturnType<typeof fakeInvoker>;

        beforeEach(async () => {
            invoker = fakeInvoker();
            render(<OrdersApplication invoker={invoker} />);
            open();
            await act(async () => { fireEvent.click(document.querySelector('.scene-slice-dialog-submit')!); });
        });

        it('should not invoke the slice', () => invoker.calls.length.should.equal(0));
        it('should keep the dialog open', () => (dialog() !== null).should.equal(true));
        it('should show the problem against the field', () => {
            const field = screen.getByLabelText('Customer', { exact: false });
            [field.getAttribute('aria-invalid'), document.getElementById(field.getAttribute('aria-describedby')!)!.textContent].should.deep.equal(['true', 'Customer is required.']);
        });
        it('should focus the field with the problem', () => document.activeElement!.getAttribute('name')!.should.equal('customer'));
    });

    describe('and the invoker reports validation errors', () => {
        beforeEach(async () => {
            render(<OrdersApplication invoker={fakeInvoker({ succeeded: false, validationErrors: [{ field: 'quantity', message: 'Quantity must be positive.' }, { message: 'The order could not be placed.' }] })} />);
            open();
            type('Customer', 'Fjordline AS');
            await act(async () => { fireEvent.click(document.querySelector('.scene-slice-dialog-submit')!); });
        });

        it('should keep the dialog open', () => (dialog() !== null).should.equal(true));
        it('should show a field problem next to its field', () =>
            document.getElementById(screen.getByLabelText('Quantity').getAttribute('aria-describedby')!)!.textContent!.should.equal('Quantity must be positive.'));
        it('should show a problem without a field for the form', () => document.querySelector('.scene-slice-dialog-summary')!.textContent!.should.equal('The order could not be placed.'));
        it('should allow submitting again', () => (document.querySelector('.scene-slice-dialog-submit') as HTMLButtonElement).disabled.should.equal(false));
    });

    describe('and the invoker fails with a message', () => {
        it('should show the message for the form', async () => {
            render(<OrdersApplication invoker={fakeInvoker({ succeeded: false, message: 'The backend is unavailable.' })} />);
            open();
            type('Customer', 'Fjordline AS');
            await act(async () => { fireEvent.click(document.querySelector('.scene-slice-dialog-submit')!); });
            document.querySelector('.scene-slice-dialog-summary')!.textContent!.should.equal('The backend is unavailable.');
        });
    });

    describe('and no invoker is provided', () => {
        let commands: { command: string; slice: string; arguments: Record<string, unknown> }[];
        const onCommand = (event: Event) => commands.push((event as CustomEvent).detail);

        beforeEach(async () => {
            commands = [];
            globalThis.addEventListener('cratis.scene.command', onCommand);
            render(<OrdersApplication />);
            open();
            type('Customer', 'Fjordline AS');
            await act(async () => { fireEvent.click(document.querySelector('.scene-slice-dialog-submit')!); });
        });

        afterEach(() => globalThis.removeEventListener('cratis.scene.command', onCommand));

        it('should announce the command as cratis.scene.command', () =>
            commands.map(command => [command.command, command.slice, command.arguments.customer]).should.deep.equal([['PlaceOrder', 'sales.orders.PlaceOrder', 'Fjordline AS']]));
        it('should close the dialog', async () => { await waitFor(() => (dialog() === null).should.equal(true)); });
    });

    describe('and the slice names its own dialog template', () => {
        it('should still open the task dialog with the slice fields', () => {
            render(<OrdersApplication invoker={fakeInvoker()} />);
            open('Ship');
            [dialog()!.getAttribute('data-scene-dialog'), document.querySelector('.scene-slice-dialog')!.getAttribute('data-scene-command')].should.deep.equal(['ShipDialog', 'ShipOrder']);
        });
    });

    describe('and the host authors the dialog template itself', () => {
        it('should render the host template instead of the built-in dialog', () => {
            render(<OrdersApplication invoker={fakeInvoker()} dialogs={{ FormDialog: { id: 'custom', componentName: 'core:text', properties: { text: 'Custom dialog' }, slots: {} } as never }} />);
            open();
            [screen.getByText('Custom dialog') !== null, document.querySelector('.scene-slice-dialog') === null].should.deep.equal([true, true]);
        });
    });
});
