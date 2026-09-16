// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { expect, vi } from 'vitest';
import { StrictMode } from 'react';
import { ArcContext, type ArcConfiguration } from '@cratis/arc.react';
import { QueryFor, QueryHttpMethod, QueryValidator } from '@cratis/arc/queries';
import { clearBindings, registerQuery } from '../../bindings';
import { externalComponent } from '../../given';
import { SceneSingleResult } from '../SceneSingleResult';

class ProjectName extends QueryFor<object | undefined, { projectId: string }> {
    readonly route = '/projects/{projectId}/name';
    readonly parameterDescriptors = [];
    readonly requiredRequestParameters = ['projectId'];
    defaultValue = undefined;

    constructor() {
        super(Object, false);
        this.setHttpMethod(QueryHttpMethod.Get);
    }
}

class ProjectNames extends QueryFor<object[]> {
    readonly route = '/projects';
    readonly parameterDescriptors = [];
    readonly requiredRequestParameters = [];
    defaultValue = [];

    constructor() { super(Object, true); }
}

class ProjectArgumentsValidator extends QueryValidator<{ projectId: string }> {
    static received: unknown;

    constructor() {
        super();
        this.ruleFor(args => {
            ProjectArgumentsValidator.received = args;
            return args.projectId;
        }).minLength(2);
    }
}

class ValidatedProjectName extends ProjectName {
    readonly validation = new ProjectArgumentsValidator();
}

function envelope(data: unknown, overrides: Record<string, unknown> = {}) {
    return {
        data, isSuccess: true, isAuthorized: true, isValid: true, hasExceptions: false,
        validationResults: [], exceptionMessages: [], exceptionStackTrace: '',
        paging: { page: 0, size: 0, totalItems: 0, totalPages: 0 }, ...overrides,
    };
}

function response(data: unknown, overrides: Record<string, unknown> = {}) {
    return { ok: true, status: 200, json: async () => envelope(data, overrides) } as Response;
}

function deferred() {
    let resolve!: (value: Response) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<Response>((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
}

describe('when executing an optional single result with native Arc 22.16.1', () => {
    const headers = () => ({ 'x-host': 'one' });
    const context: ArcConfiguration = { microservice: 'projects', origin: 'https://example.test', apiBasePath: '/backend', httpHeadersCallback: headers };
    const fetch = vi.fn<typeof globalThis.fetch>();

    function view(queryArguments: unknown = { projectId: 'A' }, arc = context, properties: Record<string, unknown> = {}) {
        return <ArcContext.Provider value={arc}>
            <SceneSingleResult element={externalComponent('Cratis.Components:singleResult', {
                query: 'ProjectName', queryArguments, enabled: true, resultField: 'name', ...properties,
            })} slots={{}} />
        </ArcContext.Provider>;
    }

    beforeEach(() => {
        clearBindings();
        registerQuery('ProjectName', ProjectName);
        registerQuery('ProjectNames', ProjectNames);
        registerQuery('ValidatedProjectName', ValidatedProjectName);
        fetch.mockReset();
        vi.stubGlobal('fetch', fetch);
    });

    afterEach(() => {
        cleanup();
        clearBindings();
        vi.unstubAllGlobals();
    });

    it('uses the native URL, arguments and context headers without changing the host object', async () => {
        const args = Object.freeze({ projectId: 'AA', locale: 'en' });
        fetch.mockResolvedValue(response({ name: '<b>Project A</b>' }));
        await act(async () => { render(view(args, context, { query: 'ValidatedProjectName' })); });
        expect(await screen.findByText('<b>Project A</b>')).not.toBeNull();
        expect(document.querySelector('b')).toBeNull();
        expect(fetch).toHaveBeenCalledTimes(1);
        const [url, init] = fetch.mock.calls[0];
        expect(String(url)).toBe('https://example.test/backend/projects/AA/name?locale=en');
        expect(ProjectArgumentsValidator.received).toBe(args);
        expect(new Headers(init?.headers).get('x-host')).toBe('one');
        expect(new Headers(init?.headers).get('x-cratis-microservice')).toBe('projects');
        expect(args).toEqual({ projectId: 'AA', locale: 'en' });
    });

    for (const value of [false, 0, '']) {
        it(`renders scalar own-field ${JSON.stringify(value)} as present`, async () => {
            fetch.mockResolvedValue(response({ name: value }));
            await act(async () => { render(view()); });
            await waitFor(() => expect(screen.getByRole('status').getAttribute('data-scene-single-result')).toBe('success'));
            expect(screen.getByRole('status').textContent).toBe(String(value));
        });
    }

    for (const data of [null, undefined]) {
        it(`shows not found for successful ${String(data)}`, async () => {
            fetch.mockResolvedValue(response(data));
            await act(async () => { render(view()); });
            expect(await screen.findByText('Not found')).not.toBeNull();
        });
    }

    for (const failure of [{ isSuccess: false }, { isAuthorized: false }, { isValid: false }, { hasExceptions: true }]) {
        it(`prioritizes failure over missing data: ${JSON.stringify(failure)}`, async () => {
            fetch.mockResolvedValue(response(null, { ...failure, exceptionMessages: ['secret'], exceptionStackTrace: 'server stack' }));
            await act(async () => { render(view()); });
            expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Unable to load result');
            expect(screen.queryByText('Not found')).toBeNull();
            expect(document.body.textContent).not.toMatch(/secret|server stack/);
        });
    }

    for (const args of [{}, { projectId: '' }, { projectId: null }, [], null, 'A', undefined]) {
        it(`does not send invalid or missing arguments: ${JSON.stringify(args)}`, async () => {
            await act(async () => { render(view(args, context, { queryArguments: args })); });
            expect(await screen.findByRole('alert')).not.toBeNull();
            expect(fetch).not.toHaveBeenCalled();
        });
    }

    it('lets the native proxy validator reject arguments without HTTP', async () => {
        await act(async () => { render(view({ projectId: 'A' }, context, { query: 'ValidatedProjectName' })); });
        expect(await screen.findByRole('alert')).not.toBeNull();
        expect(fetch).not.toHaveBeenCalled();
    });

    for (const enabled of [false, undefined, 'true']) {
        it(`is idle unless explicitly enabled: ${String(enabled)}`, async () => {
            await act(async () => { render(view({ projectId: 'A' }, context, { enabled })); });
            expect(screen.getByText('Idle')).not.toBeNull();
            expect(fetch).not.toHaveBeenCalled();
        });
    }

    it('never chooses another query when the binding is missing', async () => {
        await act(async () => { render(view({}, context, { query: 'Missing' })); });
        expect(screen.getByText(/Unresolved query binding 'Missing'/)).not.toBeNull();
        expect(fetch).not.toHaveBeenCalled();
    });

    it('aborts A and ignores reverse completion when the transport ignores abort', async () => {
        const a = deferred();
        const b = deferred();
        fetch.mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise);
        let mounted!: ReturnType<typeof render>;
        await act(async () => { mounted = render(view()); });
        expect(screen.getByText('Loading')).not.toBeNull();
        const signal = fetch.mock.calls[0][1]?.signal;
        await act(async () => { mounted.rerender(view({ projectId: 'B' })); });
        expect(signal?.aborted).toBe(true);
        await act(async () => { b.resolve(response({ name: 'B' })); });
        expect(screen.getByText('B')).not.toBeNull();
        await act(async () => { a.resolve(response({ name: 'A' })); });
        expect(screen.queryByText('A')).toBeNull();
        expect(screen.getByText('B')).not.toBeNull();
    });

    it('hides a settled A immediately on B and aborts B on disposal', async () => {
        const b = deferred();
        fetch.mockResolvedValueOnce(response({ name: 'A' })).mockReturnValueOnce(b.promise);
        let mounted!: ReturnType<typeof render>;
        await act(async () => { mounted = render(view()); });
        expect(screen.getByText('A')).not.toBeNull();
        await act(async () => { mounted.rerender(view({ projectId: 'B' })); });
        expect(screen.queryByText('A')).toBeNull();
        expect(screen.getByText('Loading')).not.toBeNull();
        mounted.unmount();
        expect(fetch.mock.calls[1][1]?.signal?.aborted).toBe(true);
        await act(async () => { b.reject(new DOMException('Aborted', 'AbortError')); });
    });

    it('reexecutes for header-only context changes and ignores the old response', async () => {
        const a = deferred();
        const b = deferred();
        const args = { projectId: 'A' };
        fetch.mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise);
        let mounted!: ReturnType<typeof render>;
        await act(async () => { mounted = render(view(args)); });
        await act(async () => { mounted.rerender(view(args, { ...context, httpHeadersCallback: () => ({ 'x-host': 'two' }) })); });
        expect(fetch.mock.calls[0][1]?.signal?.aborted).toBe(true);
        expect(new Headers(fetch.mock.calls[1][1]?.headers).get('x-host')).toBe('two');
        await act(async () => { b.resolve(response({ name: 'New context' })); a.resolve(response({ name: 'Old context' })); });
        expect(screen.getByText('New context')).not.toBeNull();
        expect(screen.queryByText('Old context')).toBeNull();
    });

    it('rejects enumerable proxies before HTTP rather than adapting them to a single model', async () => {
        await act(async () => { render(view({}, context, { query: 'ProjectNames' })); });
        expect(await screen.findByRole('alert')).not.toBeNull();
        expect(fetch).not.toHaveBeenCalled();
    });

    it('handles StrictMode disposal without an unhandled abort promise', async () => {
        const a = deferred();
        const b = deferred();
        fetch.mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise);
        await act(async () => { render(<StrictMode>{view()}</StrictMode>); });
        expect(fetch).toHaveBeenCalledTimes(2);
        expect(fetch.mock.calls[0][1]?.signal?.aborted).toBe(true);
        await act(async () => {
            a.reject(new DOMException('Aborted', 'AbortError'));
            b.resolve(response({ name: 'Current generation' }));
        });
        expect(screen.getByText('Current generation')).not.toBeNull();
    });

    it('ignores successful completion after unmount even if HTTP ignores abort', async () => {
        const pending = deferred();
        fetch.mockReturnValueOnce(pending.promise);
        let mounted!: ReturnType<typeof render>;
        await act(async () => { mounted = render(view()); });
        mounted.unmount();
        expect(fetch.mock.calls[0][1]?.signal?.aborted).toBe(true);
        await act(async () => { pending.resolve(response({ name: 'Disposed' })); });
        expect(screen.queryByText('Disposed')).toBeNull();
    });

    it('turns transport rejection and malformed envelopes into safe failure', async () => {
        fetch.mockRejectedValueOnce(new Error('private network detail'));
        let mounted!: ReturnType<typeof render>;
        await act(async () => { mounted = render(view()); });
        expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Unable to load result');
        fetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) } as Response);
        await act(async () => { mounted.rerender(view({ projectId: 'B' })); });
        expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Unable to load result');
        expect(document.body.textContent).not.toContain('private network detail');
    });

    it('aborts and clears a pending request when disabled', async () => {
        const pending = deferred();
        fetch.mockReturnValueOnce(pending.promise);
        let mounted!: ReturnType<typeof render>;
        await act(async () => { mounted = render(view()); });
        await act(async () => { mounted.rerender(view({ projectId: 'A' }, context, { enabled: false })); });
        expect(fetch.mock.calls[0][1]?.signal?.aborted).toBe(true);
        await act(async () => { pending.resolve(response({ name: 'Obsolete' })); });
        expect(screen.getByText('Idle')).not.toBeNull();
        expect(screen.queryByText('Obsolete')).toBeNull();
    });

    for (const change of [{ origin: 'https://other.test' }, { apiBasePath: '/v2' }, { microservice: 'other' }, { queryVersion: 1 }]) {
        it(`invalidates a settled result after context changes: ${JSON.stringify(change)}`, async () => {
            const pending = deferred();
            const args = { projectId: 'A' };
            fetch.mockResolvedValueOnce(response({ name: 'Old' })).mockReturnValueOnce(pending.promise);
            let mounted!: ReturnType<typeof render>;
            await act(async () => { mounted = render(view(args)); });
            await act(async () => { mounted.rerender(view(args, { ...context, ...change })); });
            expect(screen.queryByText('Old')).toBeNull();
            expect(screen.getByText('Loading')).not.toBeNull();
            expect(fetch).toHaveBeenCalledTimes(2);
            await act(async () => { pending.resolve(response({ name: 'New' })); });
            expect(screen.getByText('New')).not.toBeNull();
        });
    }

    for (const data of [{ name: {} }, { name: [] }, {}, Object.create({ name: 'Inherited' }), [{ name: 'A' }]]) {
        it(`rejects non-scalar or absent own fields: ${JSON.stringify(data)}`, async () => {
            fetch.mockResolvedValue(response(data));
            await act(async () => { render(view()); });
            expect(await screen.findByRole('alert')).not.toBeNull();
        });
    }
});
