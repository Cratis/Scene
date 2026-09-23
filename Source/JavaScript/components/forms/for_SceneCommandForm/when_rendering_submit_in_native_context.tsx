// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { CommandForm } from '@cratis/arc.react/commands';
import { InputTextField } from '@cratis/components/CommandForm';
import { CommandFormSubmit } from '../CommandFormSubmit';
import { RecordNote, RestrictedNote, successfulResponse } from './given/RecordNote';

// Exercise the private child with REAL Arc context. This does not claim AutoCommandForm footer support.
describe('when rendering the submit child inside native CommandForm', () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    beforeEach(() => { fetch.mockReset(); fetch.mockResolvedValue(successfulResponse()); vi.stubGlobal('fetch', fetch); });
    afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

    it('should let native submit expose invalid untouched fields without HTTP', async () => {
        await act(async () => { render(<CommandForm command={RecordNote}>
            <InputTextField value={(command: RecordNote) => command.subject} title='Subject' />
            <CommandFormSubmit label='Record note' />
        </CommandForm>); });
        const button = screen.getByRole<HTMLButtonElement>('button', { name: 'Record note' });
        button.disabled.should.equal(false);
        await act(async () => { fireEvent.click(button); });
        (await screen.findAllByText('Subject is required')).length.should.be.greaterThan(0);
        fetch.mock.calls.should.have.lengthOf(0);
    });

    it('should follow native busy state through completion without executing directly', async () => {
        let complete!: (response: Response) => void;
        fetch.mockReturnValueOnce(new Promise<Response>(resolve => { complete = resolve; }));
        await act(async () => { render(<CommandForm command={RecordNote} initialValues={{ subject: 'Valid' }}>
            <CommandFormSubmit label='Record note' />
        </CommandForm>); });
        const button = screen.getByRole<HTMLButtonElement>('button', { name: 'Record note' });
        button.disabled.should.equal(false);
        await act(async () => { fireEvent.click(button); });
        await waitFor(() => button.disabled.should.equal(true));
        button.getAttribute('aria-busy')!.should.equal('true');
        fireEvent.click(button);
        fetch.mock.calls.should.have.lengthOf(1);
        await act(async () => { complete(successfulResponse()); });
        await waitFor(() => button.disabled.should.equal(false));
        button.getAttribute('aria-busy')!.should.equal('false');
    });

    it('should respect native role authorization instead of deriving it in Scene', async () => {
        await act(async () => { render(<CommandForm command={RestrictedNote}>
            <CommandFormSubmit label='Record note' />
        </CommandForm>); });
        const button = screen.getByRole<HTMLButtonElement>('button', { name: 'Record note' });
        button.disabled.should.equal(true);
        fireEvent.click(button);
        fetch.mock.calls.should.have.lengthOf(0);
    });
});
