// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ArcContext } from '@cratis/arc.react';
import { SceneElementView } from '@cratis/scene.react';
import { clearBindings, registerCommand } from '../../bindings';
import { cratisComponents } from '../../cratisComponents';
import { externalComponent } from '../../given';
import { RecordNote, RestrictedNote, successfulResponse } from './given/RecordNote';

function view(properties: Record<string, unknown> = {}) {
    return <ArcContext.Provider value={{ origin: 'https://example.test', apiBasePath: '/backend', microservice: 'notes', httpHeadersCallback: () => ({ 'x-host': 'scene' }) }}>
        <SceneElementView element={externalComponent('Cratis.Components:commandForm', {
            command: 'RecordNote', exclude: ['internalValue'], ...properties,
        })} registry={cratisComponents} resolveBinding={() => undefined} />
    </ArcContext.Provider>;
}

// No Components/form/context doubles. Components <=4.12 ignores footer: these tests MUST fail there,
// not skip or pass by recreating the forthcoming upstream behavior. Only HTTP is substituted.
describe('when submitting a Scene command form through native AutoCommandForm', () => {
    const fetch = vi.fn<typeof globalThis.fetch>();

    beforeEach(() => {
        clearBindings();
        registerCommand('RecordNote', RecordNote);
        fetch.mockReset();
        fetch.mockResolvedValue(successfulResponse());
        vi.stubGlobal('fetch', fetch);
    });

    afterEach(() => { cleanup(); clearBindings(); vi.unstubAllGlobals(); });

    it('should submit the actual form with a labeled button and preserve native payload and context', async () => {
        render(view({ submitLabel: 'Record note' }));
        const button = await screen.findByRole<HTMLButtonElement>('button', { name: 'Record note' });
        button.type.should.equal('submit');
        (button.form === screen.getByRole('textbox', { name: 'Subject' }).closest('form')).should.equal(true);
        screen.queryAllByRole('textbox').should.have.lengthOf(1);
        fireEvent.change(screen.getByRole('textbox', { name: 'Subject' }), { target: { value: 'A synthetic note' } });
        fetch.mock.calls.should.have.lengthOf(0);
        await act(async () => { fireEvent.click(button); });
        await waitFor(() => fetch.mock.calls.should.have.lengthOf(1));
        const [url, request] = fetch.mock.calls[0];
        String(url).should.equal('https://example.test/backend/synthetic/notes');
        request!.method!.should.equal('POST');
        JSON.parse(String(request!.body)).should.deep.equal({ subject: 'A synthetic note', internalValue: 'proxy default' });
        new Headers(request!.headers).get('x-host')!.should.equal('scene');
        new Headers(request!.headers).get('x-cratis-microservice')!.should.equal('notes');
    });

    it('should allow untouched invalid submit to reveal native feedback and correction to execute', async () => {
        render(view());
        const button = await screen.findByRole<HTMLButtonElement>('button', { name: 'Submit' });
        button.disabled.should.equal(false);
        (screen.queryByText('Subject is required') === null).should.equal(true);
        await act(async () => { fireEvent.click(button); });
        (await screen.findAllByText('Subject is required')).length.should.be.greaterThan(0);
        fetch.mock.calls.should.have.lengthOf(0);
        button.disabled.should.equal(false);
        fireEvent.change(screen.getByRole('textbox', { name: 'Subject' }), { target: { value: 'Corrected' } });
        await act(async () => { fireEvent.click(button); });
        await waitFor(() => fetch.mock.calls.should.have.lengthOf(1));
    });

    it('should reflect native execution until HTTP settles and prevent a second button click', async () => {
        let complete!: (response: Response) => void;
        fetch.mockReturnValueOnce(new Promise<Response>(resolve => { complete = resolve; }));
        render(view());
        const button = await screen.findByRole<HTMLButtonElement>('button', { name: 'Submit' });
        fireEvent.change(screen.getByRole('textbox', { name: 'Subject' }), { target: { value: 'Pending' } });
        await act(async () => { fireEvent.click(button); });
        await waitFor(() => button.disabled.should.equal(true));
        button.getAttribute('aria-busy')!.should.equal('true');
        fireEvent.click(button);
        fetch.mock.calls.should.have.lengthOf(1);
        await act(async () => { complete(successfulResponse()); });
        await waitFor(() => button.disabled.should.equal(false));
        button.getAttribute('aria-busy')!.should.equal('false');
    });

    it('remounts the automatic native form on binding switches and same-name hot replacement', async () => {
        class MovedNote extends RecordNote { readonly route = '/synthetic/moved-notes'; }
        class HotNote extends RecordNote { readonly route = '/synthetic/hot-notes'; }
        registerCommand('MovedNote', MovedNote);
        const result = render(view());
        await screen.findByRole('button', { name: 'Submit' });
        result.rerender(view({ command: 'MovedNote' }));
        await screen.findByRole('textbox', { name: 'Subject' });
        fireEvent.change(screen.getByRole('textbox', { name: 'Subject' }), { target: { value: 'Moved' } });
        await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Submit' })); });
        await waitFor(() => fetch.mock.calls.should.have.lengthOf(1));
        String(fetch.mock.calls[0][0]).should.equal('https://example.test/backend/synthetic/moved-notes');
        registerCommand('MovedNote', RestrictedNote);
        result.rerender(view({ command: 'MovedNote' }));
        const denied = await screen.findByRole<HTMLButtonElement>('button', { name: 'Submit' });
        denied.disabled.should.equal(true);
        fireEvent.click(denied);
        fetch.mock.calls.should.have.lengthOf(1);
        registerCommand('MovedNote', HotNote);
        result.rerender(view({ command: 'MovedNote' }));
        const allowed = await screen.findByRole<HTMLButtonElement>('button', { name: 'Submit' });
        allowed.disabled.should.equal(false);
        fireEvent.change(screen.getByRole('textbox', { name: 'Subject' }), { target: { value: 'Hot' } });
        await act(async () => { fireEvent.click(allowed); });
        await waitFor(() => fetch.mock.calls.should.have.lengthOf(2));
        String(fetch.mock.calls[1][0]).should.equal('https://example.test/backend/synthetic/hot-notes');
    });

    it('should disable the button when native command authorization denies the identity', async () => {
        registerCommand('RecordNote', RestrictedNote);
        render(view());
        const button = await screen.findByRole<HTMLButtonElement>('button', { name: 'Submit' });
        button.disabled.should.equal(true);
        fireEvent.click(button);
        fetch.mock.calls.should.have.lengthOf(0);
    });
});
