// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { PropertyDescriptor } from '@cratis/arc/reflection';
import { Guid } from '@cratis/fundamentals';
import { ArcContext } from '@cratis/arc.react';
import { SceneElementView } from '@cratis/scene.react';
import { clearBindings, registerCommand } from '../../bindings';
import { cratisComponents } from '../../cratisComponents';
import { externalComponent } from '../../given';
import { StartProject } from './given/StartProject';
import { RecordNote, successfulResponse } from './given/RecordNote';

const guid = 'AABBCCDD-1234-5678-9ABC-001122334455';
const manualInputs = [{ property: 'projectId', type: 'guid', label: 'Project ID' }, { property: 'name', type: 'string', label: 'Name' }];

/** The same command after a schema change: one more required string property. */
class StartProjectWithOwner extends StartProject {
    readonly propertyDescriptors = [new PropertyDescriptor('projectId', Guid), new PropertyDescriptor('name', String), new PropertyDescriptor('owner', String)];
    owner = '';
}

function view(properties: Record<string, unknown>) {
    return <ArcContext.Provider value={{ origin: 'https://example.test', apiBasePath: '/backend', microservice: 'projects', httpHeadersCallback: () => ({}) }}>
        <SceneElementView element={externalComponent('Cratis.Components:commandForm', { submitLabel: 'Save', ...properties })}
            registry={cratisComponents} resolveBinding={() => undefined} />
    </ArcContext.Provider>;
}

describe('when switching modes and schemas on a Scene command form', () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    beforeEach(() => {
        clearBindings();
        registerCommand('RecordNote', RecordNote);
        registerCommand('StartProject', StartProject);
        fetch.mockReset();
        fetch.mockResolvedValue(successfulResponse());
        vi.stubGlobal('fetch', fetch);
    });
    afterEach(() => { cleanup(); clearBindings(); vi.unstubAllGlobals(); });

    it('should switch between auto and manual mode on the same element without leaving a second form behind', async () => {
        const result = render(view({ command: 'StartProject', mode: 'manual', inputs: manualInputs }));
        await screen.findByRole('textbox', { name: 'Project ID' });
        result.container.querySelectorAll('form').length.should.equal(1);

        result.rerender(view({ command: 'StartProject', mode: 'auto', inputs: manualInputs }));
        (await screen.findByRole('alert')).textContent!.should.contain("Required command property 'projectId'");
        result.container.querySelectorAll('form').length.should.equal(0);

        result.rerender(view({ command: 'RecordNote', mode: 'auto' }));
        await screen.findByRole('textbox', { name: 'Subject' });
        result.container.querySelectorAll('form').length.should.equal(1);

        result.rerender(view({ command: 'StartProject', mode: 'manual', inputs: manualInputs }));
        await screen.findByRole('textbox', { name: 'Project ID' });
        result.container.querySelectorAll('form').length.should.equal(1);
        (screen.queryByRole('textbox', { name: 'Subject' }) === null).should.equal(true);
    });

    it('should reject an unknown mode and an unknown field type rather than guessing', async () => {
        const unknownMode = render(view({ command: 'RecordNote', mode: 'wizard' }));
        await screen.findByRole('textbox', { name: 'Subject' });
        unknownMode.unmount();

        for (const type of ['date', 'number', 'Guid', undefined]) {
            const result = render(view({ command: 'StartProject', mode: 'manual', inputs: [{ ...manualInputs[0], type }, manualInputs[1]] }));
            (await screen.findByRole('alert')).textContent!.should.equal('Invalid command form inputs declaration');
            result.container.querySelectorAll('form').length.should.equal(0);
            result.unmount();
        }
        fetch.mock.calls.should.have.lengthOf(0);
    });

    it('should stop a manual form when the command schema gains a required property, and recover once it is declared', async () => {
        const result = render(view({ command: 'StartProject', mode: 'manual', inputs: manualInputs }));
        await screen.findByRole('textbox', { name: 'Name' });

        registerCommand('StartProject', StartProjectWithOwner);
        result.rerender(view({ command: 'StartProject', mode: 'manual', inputs: manualInputs }));
        (await screen.findByRole('alert')).textContent!.should.equal("Required command property 'owner' has no input");
        (screen.queryByRole('button', { name: 'Save' }) === null).should.equal(true);

        result.rerender(view({ command: 'StartProject', mode: 'manual', inputs: [...manualInputs, { property: 'owner', type: 'string', label: 'Owner' }] }));
        fireEvent.change(await screen.findByRole('textbox', { name: 'Project ID' }), { target: { value: guid } });
        fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Atlas' } });
        fireEvent.change(screen.getByRole('textbox', { name: 'Owner' }), { target: { value: 'Ada' } });
        await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Save' })); });
        await waitFor(() => fetch.mock.calls.should.have.lengthOf(1));
        JSON.parse(String(fetch.mock.calls[0][1]!.body)).should.deep.equal({ projectId: guid.toLowerCase(), name: 'Atlas', owner: 'Ada' });
    });

    it('should follow an auto form schema change with the new field', async () => {
        class RecordNoteWithTopic extends RecordNote {
            readonly propertyDescriptors = [new PropertyDescriptor('subject', String), new PropertyDescriptor('topic', String), new PropertyDescriptor('internalValue', String, true)];
            topic = '';
        }

        const result = render(view({ command: 'RecordNote', exclude: ['internalValue'] }));
        await screen.findByRole('textbox', { name: 'Subject' });
        (screen.queryByRole('textbox', { name: 'Topic' }) === null).should.equal(true);

        registerCommand('RecordNote', RecordNoteWithTopic);
        result.rerender(view({ command: 'RecordNote', exclude: ['internalValue'] }));
        Boolean(await screen.findByRole('textbox', { name: 'Topic' })).should.equal(true);
        result.container.querySelectorAll('form').length.should.equal(1);
    });

    it('should never nest forms, even when authored content puts a form in its slot', async () => {
        const inner = externalComponent('Cratis.Components:commandForm', { command: 'RecordNote', submitLabel: 'Inner' });
        const outer = { ...externalComponent('Cratis.Components:commandForm', { command: 'RecordNote', submitLabel: 'Outer' }), slots: { content: [inner] } };
        const result = render(<ArcContext.Provider value={{ origin: 'https://example.test', apiBasePath: '/backend', microservice: 'notes', httpHeadersCallback: () => ({}) }}>
            <SceneElementView element={outer} registry={cratisComponents} resolveBinding={() => undefined} />
        </ArcContext.Provider>);

        await screen.findByRole('button', { name: 'Outer' });
        (screen.queryByRole('button', { name: 'Inner' }) === null).should.equal(true);
        result.container.querySelectorAll('form form').length.should.equal(0);
        result.container.querySelectorAll('form').length.should.equal(1);
    });

    it('should be operable from the keyboard: labeled fields in order, then submit with Enter', async () => {
        const result = render(view({ command: 'StartProject', mode: 'manual', inputs: manualInputs }));
        const id = await screen.findByRole<HTMLInputElement>('textbox', { name: 'Project ID' });
        const name = screen.getByRole<HTMLInputElement>('textbox', { name: 'Name' });
        const save = screen.getByRole<HTMLButtonElement>('button', { name: 'Save' });

        const focusable = [...result.container.querySelectorAll<HTMLElement>('input, button, select, textarea')]
            .filter(element => !element.hasAttribute('disabled') && element.tabIndex >= 0);
        focusable.should.deep.equal([id, name, save]);
        save.type.should.equal('submit');

        id.focus();
        fireEvent.change(id, { target: { value: guid } });
        name.focus();
        fireEvent.change(name, { target: { value: 'Keyboard' } });
        fireEvent.keyDown(name, { key: 'Enter', code: 'Enter' });
        await act(async () => { fireEvent.submit(name.form!); });
        await waitFor(() => fetch.mock.calls.should.have.lengthOf(1));
        JSON.parse(String(fetch.mock.calls[0][1]!.body)).should.deep.equal({ projectId: guid.toLowerCase(), name: 'Keyboard' });
    });
});
