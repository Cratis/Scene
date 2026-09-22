// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { expect, vi } from 'vitest';
import { ArcContext } from '@cratis/arc.react';
import { QueryFor } from '@cratis/arc/queries';
import { ParameterDescriptor } from '@cratis/arc/reflection';
import { Guid } from '@cratis/fundamentals';
import { SceneElementView } from '@cratis/scene.react';
import { clearBindings, registerQuery, registerQueryIdentity, unregisterQueryIdentity } from '../../bindings';
import { cratisComponents } from '../../cratisComponents';
import { externalComponent } from '../../given';
import { ProjectById, ProjectByIdParameters } from './ProjectLookup';

const projectId = 'AB123456-7890-4ABC-8DEF-1234567890AB';
const input = { parameter: 'projectId', type: 'string', label: 'Project identifier' };
const identity = 'Projects/Registration/ProjectLookup/ProjectLookup.ts:ProjectById';
const context = { microservice: 'projects', origin: 'https://example.test', apiBasePath: '' };

function response(data: unknown) {
    return { ok: true, status: 200, json: async () => ({
        data, isSuccess: true, isAuthorized: true, isValid: true, hasExceptions: false,
        validationResults: [], exceptionMessages: [], exceptionStackTrace: '',
        paging: { page: 0, size: 0, totalItems: 0, totalPages: 0 },
    }) } as Response;
}

function view(properties: Record<string, unknown> = {}, component = 'queryInputForm') {
    return <ArcContext.Provider value={context}>
        <SceneElementView element={externalComponent(`Cratis.Components:${component}`, {
            query: 'ProjectById', inputs: [input], resultField: 'name', ...properties,
        })} registry={cratisComponents} resolveBinding={() => undefined} />
    </ArcContext.Provider>;
}

async function submit(value = projectId) {
    fireEvent.change(screen.getByRole('textbox', { name: input.label }), { target: { value } });
    await act(async () => { fireEvent.submit(screen.getByRole('form')); });
}

describe('when submitting the canonical generated Guid proxy shape through SceneElementView', () => {
    const fetch = vi.fn<typeof globalThis.fetch>();

    beforeEach(() => {
        clearBindings();
        registerQueryIdentity('ProjectById', identity, ProjectById);
        fetch.mockReset();
        fetch.mockResolvedValue(response({ name: 'Canonical project', projectId }));
        vi.stubGlobal('fetch', fetch);
    });

    afterEach(() => { cleanup(); clearBindings(); vi.unstubAllGlobals(); });

    it('keeps the generated Guid contract and inherited native perform, sending exact entered text', async () => {
        const proxy = new ProjectById();
        expect(proxy.perform).toBe(QueryFor.prototype.perform);
        expect(proxy.parameterDescriptors).toEqual([new ParameterDescriptor('projectId', Guid, false)]);
        expect(proxy.requiredRequestParameters).toEqual(['projectId']);
        expect(proxy.defaultValue).toEqual({});
        expect(proxy.queryName).toBe('CanonicalProjects.Projects.Registration.ProjectLookup.ProjectSummary.ProjectById');
        render(view());
        expect(fetch).not.toHaveBeenCalled();
        await submit();
        expect(await screen.findByText('Canonical project')).not.toBeNull();
        expect(fetch).toHaveBeenCalledTimes(1);
        const [url, init] = fetch.mock.calls[0];
        expect(String(url)).toBe(`https://example.test/api/projects/registration/project-lookup/project-by-id?projectId=${projectId}`);
        expect(init?.method).toBe('GET');
        expect(new URL(String(url)).searchParams.get('projectId')).toBe(projectId);
        expect(screen.getByRole('textbox')).toHaveProperty('value', projectId);
    });

    for (const data of [null, undefined]) {
        it(`preserves native absence (${String(data)}) despite the generated empty-object default`, async () => {
            fetch.mockResolvedValue(response(data));
            render(view()); await submit();
            expect(await screen.findByText('Not found')).not.toBeNull();
            expect(fetch).toHaveBeenCalledTimes(1);
        });
    }

    it('does not claim Guid descriptors enforce format: native perform sends an unformatted string unchanged', async () => {
        render(view()); await submit(' not-a-guid ');
        expect(await screen.findByText('Canonical project')).not.toBeNull();
        expect(new URL(String(fetch.mock.calls[0][0])).searchParams.get('projectId')).toBe(' not-a-guid ');
    });

    it('lets an explicitly supplied pattern reject invalid Guid text before HTTP and permit correction', async () => {
        render(view({ inputs: [{ ...input, pattern: '[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}' }] }));
        await submit('not-a-guid');
        expect(screen.getByRole('alert').textContent).toBe('Project identifier has an invalid format');
        expect(fetch).not.toHaveBeenCalled();
        expect(screen.getByRole('textbox')).toHaveProperty('value', 'not-a-guid');
        await submit();
        expect(await screen.findByText('Canonical project')).not.toBeNull();
        expect(new URL(String(fetch.mock.calls[0][0])).searchParams.get('projectId')).toBe(projectId);
    });

    it('retains native required-argument validation when the form permits an empty string', async () => {
        render(view({ inputs: [{ ...input, required: false }] })); await submit('');
        expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Unable to load result');
        expect(fetch).not.toHaveBeenCalled();
    });

    for (const descriptors of [
        [new ParameterDescriptor('projectId', Number, false)],
        [new ParameterDescriptor('projectId', Boolean, false)],
        [new ParameterDescriptor('projectId', Object, false)],
        [new ParameterDescriptor('projectId', Guid, true)],
        [new ParameterDescriptor('projectId', String, true)],
        [new ParameterDescriptor('ProjectID', Guid, false)],
        [],
        [new ParameterDescriptor('projectId', Guid, false), new ParameterDescriptor('projectId', String, false)],
    ]) {
        it(`rejects unsupported descriptor mapping before HTTP: ${descriptors.map(d => `${d.name}:${d.type.name}:${d.isEnumerable}`).join(',')}`, async () => {
            class Incompatible extends ProjectById { readonly parameterDescriptors = descriptors; }
            registerQueryIdentity('ProjectById', identity, Incompatible);
            render(view()); await submit();
            expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Unable to load result');
            expect(screen.getByRole('textbox')).toHaveProperty('value', projectId);
            expect(fetch).not.toHaveBeenCalled();
        });
    }

    it('rejects an unknown extra parameter even when every required native argument is present', async () => {
        render(view({ inputs: [input, { parameter: 'unknown', type: 'string', label: 'Unknown', required: false }] }));
        await submit();
        expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Unable to load result');
        expect(fetch).not.toHaveBeenCalled();
    });

    it('demonstrates why native descriptor mapping alone cannot protect the form', async () => {
        class Numeric extends ProjectById {
            readonly parameterDescriptors = [new ParameterDescriptor('projectId', Number, false)];
        }
        const proxy = new Numeric();
        proxy.setOrigin(context.origin);
        // Deliberate runtime mismatch, NOT a change to the emitted consumer's parameter interface.
        const args = { projectId: 'not-a-number', unknown: 'extra' } as unknown as ProjectByIdParameters;
        const result = await proxy.perform(args);
        expect(result.isSuccess).toBe(true);
        expect(fetch).toHaveBeenCalledTimes(1);
        const url = new URL(String(fetch.mock.calls[0][0]));
        expect(url.searchParams.get('projectId')).toBe('not-a-number');
        expect(url.searchParams.get('unknown')).toBe('extra');
    });

    it('allows an identity-only registration to serve an existing singleResult with the same semantic name', async () => {
        render(view({ queryArguments: { projectId }, enabled: true }, 'singleResult'));
        expect(await screen.findByText('Canonical project')).not.toBeNull();
        expect(new URL(String(fetch.mock.calls[0][0])).searchParams.get('projectId')).toBe(projectId);
    });

    it('fails visibly without selecting an ambiguous identity in an existing singleResult', () => {
        registerQueryIdentity('ProjectById', 'Other/ProjectById', ProjectById);
        render(view({ queryArguments: { projectId }, enabled: true }, 'singleResult'));
        expect(screen.getByText("Unresolved query binding 'ProjectById' on Cratis.Components:singleResult")).not.toBeNull();
        expect(fetch).not.toHaveBeenCalled();
    });

    it('resolves identity replacement and removal on an existing adapter host rerender', async () => {
        const mounted = render(view({ queryArguments: { projectId }, enabled: true }, 'singleResult'));
        expect(await screen.findByText('Canonical project')).not.toBeNull();
        class Replacement extends ProjectById { readonly route = '/replacement'; }
        act(() => { registerQueryIdentity('ProjectById', identity, Replacement); });
        mounted.rerender(view({ queryArguments: { projectId }, enabled: true }, 'singleResult'));
        await screen.findByText('Canonical project');
        expect(fetch).toHaveBeenCalledTimes(2);
        expect(new URL(String(fetch.mock.calls[1][0])).pathname).toBe('/replacement');
        act(() => { unregisterQueryIdentity('ProjectById', identity); });
        mounted.rerender(view({ queryArguments: { projectId }, enabled: true }, 'singleResult'));
        expect(screen.getByText("Unresolved query binding 'ProjectById' on Cratis.Components:singleResult")).not.toBeNull();
        expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('keeps legacy replacement authoritative for singleResult while queryInputForm rejects mixed candidates', async () => {
        class Legacy extends ProjectById { readonly route = '/legacy'; }
        registerQuery('ProjectById', ProjectById);
        registerQuery('ProjectById', Legacy);
        const mounted = render(view({ queryArguments: { projectId }, enabled: true }, 'singleResult'));
        expect(await screen.findByText('Canonical project')).not.toBeNull();
        expect(new URL(String(fetch.mock.calls[0][0])).pathname).toBe('/legacy');
        mounted.rerender(view());
        expect(screen.getByRole('alert').textContent).toContain("Ambiguous query binding 'ProjectById'");
        expect(fetch).toHaveBeenCalledTimes(1);
    });
});
