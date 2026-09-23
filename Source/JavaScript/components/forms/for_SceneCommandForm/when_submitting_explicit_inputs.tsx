// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ArcContext } from '@cratis/arc.react';
import { SceneElementView } from '@cratis/scene.react';
import { clearBindings, registerCommand } from '../../bindings';
import { cratisComponents } from '../../cratisComponents';
import { externalComponent } from '../../given';
import { AmbiguousProject, OptionalUnsupported, RequiredUnsupported, RestrictedProject, StartProject } from './given/StartProject';
import { RecordNote, successfulResponse } from './given/RecordNote';

const inputs = [{ property: 'projectId', type: 'guid', label: 'Project ID' }, { property: 'name', type: 'string', label: 'Name' }];
const guid = 'AABBCCDD-1234-5678-9ABC-001122334455';

function view(properties: Record<string, unknown> = {}, explicit = true) {
    return <ArcContext.Provider value={{ origin: 'https://example.test', apiBasePath: '/backend', microservice: 'projects', httpHeadersCallback: () => ({ 'x-host': 'scene' }) }}>
        <SceneElementView element={externalComponent('Cratis.Components:commandForm', { command: 'StartProject', ...(explicit ? { inputs } : {}), submitLabel: 'Create project', ...properties })}
            registry={cratisComponents} resolveBinding={() => undefined} />
    </ArcContext.Provider>;
}

describe('explicit Scene command form using native Arc proxy and execution', () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    beforeEach(() => { clearBindings(); registerCommand('StartProject', StartProject); fetch.mockReset(); fetch.mockResolvedValue(successfulResponse()); vi.stubGlobal('fetch', fetch); });
    afterEach(() => { cleanup(); clearBindings(); vi.unstubAllGlobals(); });

    it('rejects untouched, blank and malformed GUIDs, and blank name without HTTP; corrected fields submit the typed payload', async () => {
        render(view());
        const button = await screen.findByRole<HTMLButtonElement>('button', { name: 'Create project' });
        const id = screen.getByRole<HTMLInputElement>('textbox', { name: 'Project ID' });
        const name = screen.getByRole<HTMLInputElement>('textbox', { name: 'Name' });
        (button.form === id.closest('form')).should.equal(true);
        await act(async () => { fireEvent.submit(button.form!); });
        (await screen.findAllByText('Project ID is required')).length.should.be.greaterThan(0);
        fetch.mock.calls.should.have.lengthOf(0);
        fireEvent.change(id, { target: { value: 'not-a-guid' } });
        fireEvent.change(name, { target: { value: '' } });
        await act(async () => { fireEvent.submit(button.form!); });
        (await screen.findAllByText('Project ID must be a valid GUID')).length.should.be.greaterThan(0);
        fetch.mock.calls.should.have.lengthOf(0);
        fireEvent.change(id, { target: { value: guid } });
        await act(async () => { fireEvent.submit(button.form!); });
        (await screen.findAllByText('Name is required')).length.should.be.greaterThan(0);
        fetch.mock.calls.should.have.lengthOf(0);
        fireEvent.change(name, { target: { value: '  My Project  ' } });
        await act(async () => { fireEvent.click(button); });
        await waitFor(() => fetch.mock.calls.should.have.lengthOf(1));
        const [url, request] = fetch.mock.calls[0];
        String(url).should.equal('https://example.test/backend/synthetic/projects');
        request!.method!.should.equal('POST');
        JSON.parse(String(request!.body)).should.deep.equal({ projectId: guid.toLowerCase(), name: '  My Project  ' });
        new Headers(request!.headers).get('x-host')!.should.equal('scene');
        new Headers(request!.headers).get('x-cratis-microservice')!.should.equal('projects');
        fireEvent.change(id, { target: { value: 'broken again' } });
        await act(async () => { fireEvent.submit(button.form!); });
        fetch.mock.calls.should.have.lengthOf(1);
    });

    it('keeps a typed Guid valid across a label change and executes exactly once', async () => {
        const result = render(view());
        await screen.findByRole('button', { name: 'Create project' });
        fireEvent.change(screen.getByRole('textbox', { name: 'Project ID' }), { target: { value: guid } });
        fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Renamed label' } });
        result.rerender(view({ inputs: [{ ...inputs[0], label: 'Project identifier' }, inputs[1]] }));
        const id = screen.getByRole('textbox', { name: 'Project identifier' });
        (id as HTMLInputElement).value.should.equal(guid);
        await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Create project' })); });
        await waitFor(() => fetch.mock.calls.should.have.lengthOf(1));
        JSON.parse(String(fetch.mock.calls[0][1]!.body)).should.deep.equal({ projectId: guid.toLowerCase(), name: 'Renamed label' });
    });

    it('keeps a malformed Guid blocked when its label changes, then submits the corrected typed value', async () => {
        const result = render(view());
        await screen.findByRole('button', { name: 'Create project' });
        fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'After correction' } });
        fireEvent.change(screen.getByRole('textbox', { name: 'Project ID' }), { target: { value: 'not-a-guid' } });
        (await screen.findAllByText('Project ID must be a valid GUID')).length.should.be.greaterThan(0);
        result.rerender(view({ inputs: [{ ...inputs[0], label: 'Project identifier' }, inputs[1]] }));
        const id = screen.getByRole<HTMLInputElement>('textbox', { name: 'Project identifier' });
        id.value.should.equal('not-a-guid');
        (await screen.findAllByText('Project identifier must be a valid GUID')).length.should.be.greaterThan(0);
        (screen.queryByText('Project ID must be a valid GUID') === null).should.equal(true);
        await act(async () => { fireEvent.submit(id.closest('form')!); });
        fetch.mock.calls.should.have.lengthOf(0);
        fireEvent.change(id, { target: { value: guid } });
        await act(async () => { fireEvent.submit(id.closest('form')!); });
        await waitFor(() => fetch.mock.calls.should.have.lengthOf(1));
        JSON.parse(String(fetch.mock.calls[0][1]!.body)).should.deep.equal({ projectId: guid.toLowerCase(), name: 'After correction' });
    });

    it('remounts the native explicit proxy on a binding switch and same-name hot replacement', async () => {
        class MovedProject extends StartProject { readonly route = '/synthetic/moved-projects'; }
        class HotProject extends StartProject { readonly route = '/synthetic/hot-projects'; }
        registerCommand('MovedProject', MovedProject);
        const result = render(view());
        await screen.findByRole('button', { name: 'Create project' });
        result.rerender(view({ command: 'MovedProject' }));
        await screen.findByRole('textbox', { name: 'Project ID' });
        fireEvent.change(screen.getByRole('textbox', { name: 'Project ID' }), { target: { value: guid } });
        fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Moved' } });
        await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Create project' })); });
        await waitFor(() => fetch.mock.calls.should.have.lengthOf(1));
        String(fetch.mock.calls[0][0]).should.equal('https://example.test/backend/synthetic/moved-projects');
        registerCommand('MovedProject', RestrictedProject);
        result.rerender(view({ command: 'MovedProject' }));
        const denied = await screen.findByRole<HTMLButtonElement>('button', { name: 'Create project' });
        denied.disabled.should.equal(true);
        fireEvent.click(denied);
        fetch.mock.calls.should.have.lengthOf(1);
        registerCommand('MovedProject', HotProject);
        result.rerender(view({ command: 'MovedProject' }));
        const allowed = await screen.findByRole<HTMLButtonElement>('button', { name: 'Create project' });
        allowed.disabled.should.equal(false);
        fireEvent.change(screen.getByRole('textbox', { name: 'Project ID' }), { target: { value: guid } });
        fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Hot' } });
        await act(async () => { fireEvent.click(allowed); });
        await waitFor(() => fetch.mock.calls.should.have.lengthOf(2));
        String(fetch.mock.calls[1][0]).should.equal('https://example.test/backend/synthetic/hot-projects');
    });

    it('uses native authorization and executing state', async () => {
        registerCommand('StartProject', RestrictedProject);
        render(view());
        const button = await screen.findByRole<HTMLButtonElement>('button', { name: 'Create project' });
        button.disabled.should.equal(true);
        fireEvent.click(button);
        fetch.mock.calls.should.have.lengthOf(0);
    });

    it('reflects native execution state and blocks a second button click while pending', async () => {
        let complete!: (response: Response) => void;
        fetch.mockReturnValueOnce(new Promise<Response>(resolve => { complete = resolve; }));
        render(view());
        const button = await screen.findByRole<HTMLButtonElement>('button', { name: 'Create project' });
        fireEvent.change(screen.getByRole('textbox', { name: 'Project ID' }), { target: { value: guid } });
        fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Pending' } });
        await act(async () => { fireEvent.click(button); });
        await waitFor(() => button.disabled.should.equal(true));
        button.getAttribute('aria-busy')!.should.equal('true');
        fireEvent.click(button);
        fetch.mock.calls.should.have.lengthOf(1);
        await act(async () => { complete(successfulResponse()); });
        await waitFor(() => button.disabled.should.equal(false));
    });

    it('blocks malformed declarations, unknown names, mismatches, uncovered and ambiguous required descriptors', async () => {
        const invalid = [
            { inputs: [] }, { inputs: [{ property: 'name', type: 'string', label: 'Name' }, { property: 'name', type: 'string', label: 'Again' }] },
            { inputs: [{ property: 'PROJECTID', type: 'guid', label: 'ID' }, inputs[1]] },
            { inputs: [{ ...inputs[0], type: 'string' }, inputs[1]] },
            { inputs: [inputs[1]] }, { inputs: [{ ...inputs[0], type: 'number' }, inputs[1]] },
        ];
        for (const properties of invalid) {
            const result = render(view(properties));
            (await screen.findByRole('alert')).textContent!.length.should.be.greaterThan(0);
            (screen.queryByRole('button', { name: 'Create project' }) === null).should.equal(true);
            result.unmount();
        }
        registerCommand('StartProject', AmbiguousProject);
        render(view());
        (await screen.findByRole('alert')).textContent!.should.contain('Ambiguous');
        fetch.mock.calls.should.have.lengthOf(0);
    });

    it('accepts optional unsupported descriptors when unbound but rejects required unsupported descriptors', async () => {
        registerCommand('StartProject', OptionalUnsupported);
        const result = render(view());
        Boolean(await screen.findByRole('button', { name: 'Create project' })).should.equal(true);
        result.unmount();
        registerCommand('StartProject', RequiredUnsupported);
        render(view());
        (await screen.findByRole('alert')).textContent!.should.contain("Required command property 'details'");
    });

    it('refuses automatic forms with required GUID rather than silently dropping it', async () => {
        render(view({}, false));
        (await screen.findByRole('alert')).textContent!.should.contain("Required command property 'projectId'");
        fetch.mock.calls.should.have.lengthOf(0);
    });

    it('does not allow auto exclusions to hide required supported fields', async () => {
        registerCommand('StartProject', RecordNote);
        render(view({ exclude: ['subject'] }, false));
        (await screen.findByRole('alert')).textContent!.should.contain("Required command property 'subject'");
        fetch.mock.calls.should.have.lengthOf(0);
    });
});
