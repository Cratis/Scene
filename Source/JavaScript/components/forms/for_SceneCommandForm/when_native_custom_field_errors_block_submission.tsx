// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { CommandForm } from '@cratis/arc.react/commands';
import { InputTextField } from '@cratis/components/CommandForm';
import { CommandFormSubmit } from '../CommandFormSubmit';
import { RecordNote, successfulResponse } from './given/RecordNote';

// Independent native prerequisite gate: Arc PR #2724 (expected 22.19.1), not a Scene workaround.
// This does not exercise or simulate AutoCommandForm's forthcoming footer seam.
describe('when native custom field errors block submission', () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    beforeEach(() => { fetch.mockReset(); fetch.mockResolvedValue(successfulResponse()); vi.stubGlobal('fetch', fetch); });
    afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

    it('should leave submit enabled for feedback but let the native form reject a custom field error', async () => {
        await act(async () => { render(<CommandForm command={RecordNote}
            onFieldValidate={() => 'Subject is rejected by the field'}>
            <InputTextField value={(command: RecordNote) => command.subject} title='Subject' />
            <CommandFormSubmit label='Record note' />
        </CommandForm>); });
        const input = screen.getByRole('textbox', { name: 'Subject' });
        fireEvent.change(input, { target: { value: 'Passes the command validator' } });
        await act(async () => { fireEvent.blur(input); });
        (await screen.findAllByText('Subject is rejected by the field')).length.should.be.greaterThan(0);
        const button = screen.getByRole<HTMLButtonElement>('button', { name: 'Record note' });
        button.disabled.should.equal(false);
        await act(async () => { fireEvent.click(button); });
        fetch.mock.calls.should.have.lengthOf(0);
    });
});
