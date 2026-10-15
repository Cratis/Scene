// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { SliceCommandField } from '../slices/SliceCommandField';
import { SliceCommandFieldsProvider } from '../slices/SliceCommandFieldsContext';
import { SliceDialogView } from '../slices/SliceDialogView';
import { SliceInvokerProvider } from '../slices/SliceInvokerContext';
import { SliceInvoker } from '../slices/SliceInvoker';

const fields: SliceCommandField[] = [
    { name: 'customer', type: 'string', initialValue: 'Fjordline AS' },
    { name: 'quantity', type: 'number', initialValue: 4 },
    { name: 'express', type: 'boolean', initialValue: true },
    { name: 'note', type: 'string' },
];

describe('when a slice dialog has initial values', () => {
    afterEach(cleanup);

    let payloads: Record<string, unknown>[];
    beforeEach(async () => {
        payloads = [];
        const invoker: SliceInvoker = { invoke: async (_slice, payload) => { payloads.push(payload); return { succeeded: true }; } };
        render(<SliceInvokerProvider invoker={invoker}><SliceCommandFieldsProvider fieldsFor={() => fields}>
            <SliceDialogView slice='sales.orders.PlaceOrder' command='PlaceOrder' title='New order' onClose={() => undefined} />
        </SliceCommandFieldsProvider></SliceInvokerProvider>);
        await act(async () => { fireEvent.click(document.querySelector('.scene-slice-dialog-submit')!); });
    });

    it('should start each field with its value', () =>
        [(screen.getByLabelText('Customer') as HTMLInputElement).value, (screen.getByLabelText('Quantity') as HTMLInputElement).value, (screen.getByLabelText('Express') as HTMLInputElement).checked, (screen.getByLabelText('Note') as HTMLInputElement).value]
            .should.deep.equal(['Fjordline AS', '4', true, '']));
    it('should submit them as typed', () => payloads.should.deep.equal([{ customer: 'Fjordline AS', quantity: 4, express: true, note: '' }]));
});
