// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactElement } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AutoCommandForm, InputTextField } from '@cratis/components/CommandForm';
import { ArcContext } from '@cratis/arc.react';
import { CommandForm } from '@cratis/arc.react/commands';
import { SceneElementView } from '@cratis/scene.react';
import { clearBindings, registerCommand } from '../../bindings';
import { cratisComponents } from '../../cratisComponents';
import { externalComponent } from '../../given';
import { RecordNote, successfulResponse } from './given/RecordNote';

const arc = { origin: 'https://example.test', apiBasePath: '/backend', microservice: 'notes', httpHeadersCallback: () => ({}) };
const host = (child: ReactElement) => <ArcContext.Provider value={arc}>{child}</ArcContext.Provider>;
const sceneForm = (properties: Record<string, unknown>) => host(
    <SceneElementView element={externalComponent('Cratis.Components:commandForm', { command: 'RecordNote', submitLabel: 'Save', ...properties })}
        registry={cratisComponents} resolveBinding={() => undefined} />);

/** What an application written directly against Cratis Components and Arc renders for the same command. */
const generatedAuto = () => host(
    <AutoCommandForm command={RecordNote as never} exclude={['internalValue']} footer={<button type='submit'>Save</button>} />);
const generatedManual = () => host(
    <CommandForm command={RecordNote} showTitles={false}>
        <InputTextField<RecordNote> value={command => command.subject} title='Subject' />
        <button type='submit'>Save</button>
    </CommandForm>);

interface Observation {
    fields: string[];
    rejected: string[];
    requestsAfterRejection: number;
    typed: string;
    payload: unknown;
    afterSuccess: { subject: string; alerts: string[]; saveEnabled: boolean };
}

/** Drives one rendered form the way a user would and records everything a user or server could observe. */
async function observe(view: ReactElement): Promise<Observation> {
    const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async () => new Response(JSON.stringify(await successfulResponse().json()), { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetch);
    render(view);
    const subject = await screen.findByRole<HTMLInputElement>('textbox', { name: 'Subject' });
    const save = screen.getByRole<HTMLButtonElement>('button', { name: 'Save' });
    // Every editable field, by the accessible name a user and assistive technology know it by.
    const fields = screen.getAllByRole<HTMLInputElement>('textbox').map(box => (box.labels?.[0]?.textContent ?? box.getAttribute('aria-label') ?? '').trim());

    await act(async () => { fireEvent.submit(save.form!); });
    const rejected = (await screen.findAllByText('Subject is required')).map(message => message.textContent!).slice(0, 1);
    const requestsAfterRejection = fetch.mock.calls.length;

    fireEvent.change(subject, { target: { value: 'Quarterly review' } });
    const typed = subject.value;
    await act(async () => { fireEvent.submit(save.form!); });
    await waitFor(() => fetch.mock.calls.should.have.lengthOf(1));
    const payload = JSON.parse(String(fetch.mock.calls[0][1]!.body));
    await waitFor(() => save.disabled.should.equal(false));
    const afterSuccess = {
        subject: subject.value,
        alerts: screen.queryAllByRole('alert').map(alert => alert.textContent ?? ''),
        saveEnabled: !save.disabled,
    };

    cleanup();
    vi.unstubAllGlobals();
    return { fields, rejected, requestsAfterRejection, typed, payload, afterSuccess };
}

describe('when comparing a Scene command form with the generated app path', () => {
    beforeEach(() => { clearBindings(); registerCommand('RecordNote', RecordNote); });
    afterEach(() => { cleanup(); clearBindings(); vi.unstubAllGlobals(); });

    it('should observe the same fields, validation, values, payload and response in auto mode', async () => {
        const scene = await observe(sceneForm({ mode: 'auto', exclude: ['internalValue'] }));
        const generated = await observe(generatedAuto());
        scene.should.deep.equal(generated);
        scene.should.deep.include({ fields: ['Subject'], rejected: ['Subject is required'], requestsAfterRejection: 0, typed: 'Quarterly review' });
    });

    it('should observe the same fields, validation, values, payload and response in manual mode', async () => {
        const scene = await observe(sceneForm({ mode: 'manual', inputs: [{ property: 'subject', type: 'string', label: 'Subject' }] }));
        const generated = await observe(generatedManual());
        scene.should.deep.equal(generated);
        (scene.payload as { subject: string }).subject.should.equal('Quarterly review');
    });
});
