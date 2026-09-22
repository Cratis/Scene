// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, vi } from 'vitest';
import { ArcContext, type ArcConfiguration } from '@cratis/arc.react';
import { QueryFor, QueryHttpMethod, QueryValidator } from '@cratis/arc/queries';
import { ParameterDescriptor } from '@cratis/arc/reflection';
import { SceneElementView } from '@cratis/scene.react';
import { clearBindings, registerQuery, registerQueryIdentity, unregisterQueryIdentity } from '../../bindings';
import { cratisComponents } from '../../cratisComponents';
import { externalComponent } from '../../given';

class ArgumentsValidator extends QueryValidator<{ projectId: string }> {
    static received: object[] = [];
    constructor() {
        super();
        this.ruleFor(args => {
            // ruleFor first invokes the accessor on a property-name discovery proxy, not request data.
            if (Object.hasOwn(args, 'projectId')) ArgumentsValidator.received.push(args);
            return args.projectId;
        }).minLength(2);
    }
}

// Native published Arc perform, required argument checks, validator, routing and deserialization.
// Only fetch is substituted; neither the renderer nor any runtime/primitive is mocked.
class ProjectName extends QueryFor<object | undefined, { projectId: string }> {
    readonly route = '/projects/{projectId}/name';
    readonly requiredRequestParameters = ['projectId'];
    readonly parameterDescriptors = [
        new ParameterDescriptor('projectId', String, false),
        new ParameterDescriptor('locale', String, false),
        new ParameterDescriptor('toString', String, false),
    ];
    readonly validation = new ArgumentsValidator();
    defaultValue = undefined;
    constructor() {
        super(Object, false);
        this.setHttpMethod(QueryHttpMethod.Get);
        // Model an unset descriptor-backed instance slot, not Object.prototype.toString:
        // native Arc collects instance values as well as the explicit perform arguments.
        Object.defineProperty(this, 'toString', { value: undefined });
    }
}

class AllProjects extends QueryFor<object[]> {
    readonly route = '/projects';
    readonly requiredRequestParameters = [];
    readonly parameterDescriptors = [];
    defaultValue = [];
    constructor() { super(Object, true); this.setHttpMethod(QueryHttpMethod.Get); }
}

function response(data: unknown, overrides: Record<string, unknown> = {}) {
    return { ok: true, status: 200, json: async () => ({
        data, isSuccess: true, isAuthorized: true, isValid: true, hasExceptions: false,
        validationResults: [], exceptionMessages: [], exceptionStackTrace: '',
        paging: { page: 0, size: 0, totalItems: 0, totalPages: 0 }, ...overrides,
    }) } as Response;
}

function deferred() {
    let resolve!: (response: Response) => void;
    const promise = new Promise<Response>(yes => { resolve = yes; });
    return { promise, resolve };
}

const input = { parameter: 'projectId', type: 'string', label: 'Project identifier' };
const context: ArcConfiguration = {
    microservice: 'projects', origin: 'https://example.test', apiBasePath: '/backend',
    httpHeadersCallback: () => ({ 'x-host': 'original' }),
};

function view(properties: Record<string, unknown> = {}, arc = context, isEnabled = true) {
    const element = { ...externalComponent('Cratis.Components:queryInputForm', {
        query: 'ProjectName', inputs: [input], resultField: 'name', ...properties,
    }), isEnabled };
    return <ArcContext.Provider value={arc}>
        <SceneElementView element={element} registry={cratisComponents} resolveBinding={() => undefined} />
    </ArcContext.Provider>;
}

function edit(value: string, label = 'Project identifier') {
    fireEvent.change(screen.getByRole('textbox', { name: label }), { target: { value } });
}

async function submit() {
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Search' })); });
}

describe('when submitting query inputs through SceneElementView and native Arc', () => {
    const fetch = vi.fn<typeof globalThis.fetch>();

    beforeEach(() => {
        clearBindings();
        registerQueryIdentity('ProjectName', 'Queries/ProjectName', ProjectName);
        registerQuery('AllProjects', AllProjects);
        ArgumentsValidator.received = [];
        fetch.mockReset();
        fetch.mockResolvedValue(response({ name: 'Project result' }));
        vi.stubGlobal('fetch', fetch);
    });

    afterEach(() => { cleanup(); clearBindings(); vi.unstubAllGlobals(); });

    it('starts empty, never executes while editing, and commits exact named strings in an immutable snapshot', async () => {
        render(view({ inputs: [input, { parameter: 'locale', type: 'string', label: 'Locale', required: false }] }));
        expect(screen.getByRole('textbox', { name: input.label })).toHaveProperty('value', '');
        edit('  exact-ID  ');
        edit(' nb & en ', 'Locale');
        expect(fetch).not.toHaveBeenCalled();
        expect(ArgumentsValidator.received).toHaveLength(0);
        await submit();
        expect(await screen.findByText('Project result')).not.toBeNull();
        expect(fetch).toHaveBeenCalledTimes(1);
        const [url, init] = fetch.mock.calls[0];
        expect(String(url)).toBe('https://example.test/backend/projects/%20%20exact-ID%20%20/name?locale=+nb+%26+en+');
        expect(new Headers(init?.headers).get('x-host')).toBe('original');
        expect(new Headers(init?.headers).get('x-cratis-microservice')).toBe('projects');
        const snapshot = ArgumentsValidator.received[0];
        expect(snapshot).toEqual({ projectId: '  exact-ID  ', locale: ' nb & en ' });
        expect(Object.isFrozen(snapshot)).toBe(true);
        edit('different');
        expect(screen.queryByText('Project result')).toBeNull();
        expect(snapshot).toEqual({ projectId: '  exact-ID  ', locale: ' nb & en ' });
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('uses the native form submit event (also emitted by implicit Enter submission)', async () => {
        render(view());
        edit('entered-id');
        // jsdom does not implement implicit keyboard submission; dispatch its native submit event.
        await act(async () => { fireEvent.submit(screen.getByRole('form', { name: 'Query input' })); });
        expect(await screen.findByText('Project result')).not.toBeNull();
        expect(String(fetch.mock.calls[0][0])).toContain('/entered-id/name');
    });

    for (const blank of ['', '   ', '\t']) {
        it(`shows required input feedback without performing for ${JSON.stringify(blank)}`, async () => {
            render(view());
            edit(blank);
            await submit();
            expect(screen.getByRole('alert').textContent).toBe('Project identifier is required');
            const control = screen.getByRole('textbox', { name: input.label });
            expect(control.getAttribute('aria-invalid')).toBe('true');
            expect(control.getAttribute('aria-describedby')).toBe(screen.getByRole('alert').id);
            expect(ArgumentsValidator.received).toHaveLength(0);
            expect(fetch).not.toHaveBeenCalled();
        });
    }

    it('validates an explicitly declared whole-string format without coercion and allows correction', async () => {
        render(view({ inputs: [{ ...input, pattern: '[A-Z]{2}-[0-9]{2}' }] }));
        edit(' xx-12 ');
        await submit();
        expect(screen.getByRole('alert').textContent).toBe('Project identifier has an invalid format');
        expect(fetch).not.toHaveBeenCalled();
        expect(ArgumentsValidator.received).toHaveLength(0);
        expect(screen.getByRole('textbox')).toHaveProperty('value', ' xx-12 ');
        edit('AB-12');
        await submit();
        expect(await screen.findByText('Project result')).not.toBeNull();
        expect(ArgumentsValidator.received[0]).toEqual({ projectId: 'AB-12' });
    });

    for (const value of ['12\n', '12\r', '12\r\n', '12\u2028', '12\u2029']) {
        it(`rejects a final line terminator in whole-string patterns: ${JSON.stringify(value)}`, async () => {
            // Without the multiline flag JS $ requires the actual end. Native text controls
            // sanitize CR/LF; inject a raw value to exercise validation without that help.
            expect(/^(?:[0-9]+)$/u.test(value)).toBe(false);
            render(view({ inputs: [{ ...input, pattern: '[0-9]+' }] }));
            const control = screen.getByRole('textbox');
            Object.defineProperty(control, 'value', { configurable: true, get: () => value });
            fireEvent.change(control);
            await submit();
            expect(screen.getByRole('alert').textContent).toBe('Project identifier has an invalid format');
            expect(control).toHaveProperty('value', value);
            expect(ArgumentsValidator.received).toHaveLength(0);
            expect(fetch).not.toHaveBeenCalled();
        });
    }

    it('preserves an explicitly allowed newline through validation and native HTTP', async () => {
        const value = '12\n';
        render(view({ inputs: [{ ...input, pattern: '[0-9]+\\s' }] }));
        const control = screen.getByRole('textbox');
        Object.defineProperty(control, 'value', { configurable: true, get: () => value });
        fireEvent.change(control);
        await submit();
        expect(await screen.findByText('Project result')).not.toBeNull();
        expect(ArgumentsValidator.received[0]).toEqual({ projectId: value });
        expect(String(fetch.mock.calls[0][0])).toContain('/12%0A/name');
    });

    it('lets native validation reject without HTTP, retains drafts, and allows retry after correction', async () => {
        render(view());
        edit('x');
        await submit();
        expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Unable to load result');
        expect(fetch).not.toHaveBeenCalled();
        expect(ArgumentsValidator.received[0]).toEqual({ projectId: 'x' });
        expect(screen.getByRole('textbox')).toHaveProperty('value', 'x');
        edit('xx');
        await submit();
        expect(await screen.findByText('Project result')).not.toBeNull();
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('does not guess parameter names when a declaration mismatches the proxy', async () => {
        render(view({ inputs: [{ ...input, parameter: 'ProjectID' }] }));
        edit('explicit-id');
        await submit();
        expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Unable to load result');
        expect(fetch).not.toHaveBeenCalled();
    });

    for (const data of [null, undefined]) {
        it(`shows not found for a successful ${String(data)} model and permits repeat submit`, async () => {
            fetch.mockResolvedValueOnce(response(data));
            render(view()); edit('missing-id'); await submit();
            expect(await screen.findByText('Not found')).not.toBeNull();
            await submit();
            expect(await screen.findByText('Project result')).not.toBeNull();
            expect(fetch).toHaveBeenCalledTimes(2);
            expect(ArgumentsValidator.received[0]).toEqual(ArgumentsValidator.received[1]);
            expect(ArgumentsValidator.received[0]).not.toBe(ArgumentsValidator.received[1]);
        });
    }

    it('allows retry of unchanged input after transport failure', async () => {
        fetch.mockRejectedValueOnce(new Error('private network details'));
        render(view()); edit('retry-id'); await submit();
        expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Unable to load result');
        expect(document.body.textContent).not.toContain('private network details');
        await submit();
        expect(await screen.findByText('Project result')).not.toBeNull();
        expect(fetch).toHaveBeenCalledTimes(2);
    });

    for (const failure of [{ isValid: false }, { isAuthorized: false }, { isSuccess: false }, { hasExceptions: true }]) {
        it(`preserves native failure precedence for ${JSON.stringify(failure)}`, async () => {
            fetch.mockResolvedValue(response(null, { ...failure, exceptionMessages: ['secret'] }));
            render(view()); edit('valid-id'); await submit();
            expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Unable to load result');
            expect(screen.queryByText('Not found')).toBeNull();
            expect(document.body.textContent).not.toContain('secret');
        });
    }

    it('aborts on edit and ignores stale response after a newer submission even when HTTP ignores abort', async () => {
        const a = deferred(); const b = deferred();
        fetch.mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise);
        render(view()); edit('first'); await submit();
        const signal = fetch.mock.calls[0][1]?.signal;
        edit('second');
        expect(signal?.aborted).toBe(true);
        expect(screen.getByText('Idle')).not.toBeNull();
        expect(fetch).toHaveBeenCalledTimes(1);
        await submit();
        await act(async () => { b.resolve(response({ name: 'Second result' })); });
        await act(async () => { a.resolve(response({ name: 'Obsolete result' })); });
        expect(screen.getByText('Second result')).not.toBeNull();
        expect(screen.queryByText('Obsolete result')).toBeNull();
    });

    it('never resurrects a result by editing back to the previously submitted value', async () => {
        render(view()); edit('first'); await submit();
        expect(await screen.findByText('Project result')).not.toBeNull();
        edit('second'); edit('first');
        expect(screen.queryByText('Project result')).toBeNull();
        expect(screen.getByText('Idle')).not.toBeNull();
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('ignores a pending result after edit without a second submit', async () => {
        const pending = deferred(); fetch.mockReturnValueOnce(pending.promise);
        render(view()); edit('first'); await submit(); edit('second');
        await act(async () => { pending.resolve(response({ name: 'Obsolete result' })); });
        expect(screen.queryByText('Obsolete result')).toBeNull();
        expect(screen.getByText('Idle')).not.toBeNull();
    });

    it('aborts on unmount and ignores successful late completion', async () => {
        const pending = deferred(); fetch.mockReturnValueOnce(pending.promise);
        const mounted = render(view()); edit('first'); await submit();
        mounted.unmount();
        expect(fetch.mock.calls[0][1]?.signal?.aborted).toBe(true);
        await act(async () => { pending.resolve(response({ name: 'Disposed result' })); });
        expect(screen.queryByText('Disposed result')).toBeNull();
    });

    it('reuses runtime invalidation when Arc context headers change', async () => {
        const pending = deferred();
        const mounted = render(view()); edit('first'); await submit();
        expect(await screen.findByText('Project result')).not.toBeNull();
        fetch.mockReturnValueOnce(pending.promise);
        mounted.rerender(view({}, { ...context, httpHeadersCallback: () => ({ 'x-host': 'new' }) }));
        expect(screen.queryByText('Project result')).toBeNull();
        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
        expect(new Headers(fetch.mock.calls[1][1]?.headers).get('x-host')).toBe('new');
        await act(async () => { pending.resolve(response({ name: 'New context' })); });
        expect(screen.getByText('New context')).not.toBeNull();
    });

    for (const query of [undefined, 'Missing', 'projectname']) {
        it(`visibly fails exact missing binding ${String(query)} without choosing AllProjects`, () => {
            render(view({ query }));
            expect(screen.getByText(query ? `Unresolved query binding '${query}' on Cratis.Components:queryInputForm` : 'Missing query binding on Cratis.Components:queryInputForm')).not.toBeNull();
            expect(screen.queryByRole('textbox')).toBeNull();
            expect(fetch).not.toHaveBeenCalled();
        });
    }

    it('shows ambiguous identity registrations and never chooses a candidate', () => {
        registerQueryIdentity('ProjectName', 'Other/ProjectName', ProjectName);
        render(view());
        expect(screen.getByRole('alert').textContent).toContain("Ambiguous query binding 'ProjectName'");
        expect(screen.queryByRole('textbox')).toBeNull();
        expect(fetch).not.toHaveBeenCalled();
    });

    it('fails closed and cancels when a mounted binding becomes ambiguous, then starts fresh on resolution', async () => {
        const pending = deferred(); fetch.mockReturnValueOnce(pending.promise);
        render(view()); edit('first'); await submit();
        act(() => { registerQueryIdentity('ProjectName', 'Other/ProjectName', ProjectName); });
        expect(screen.getByRole('alert').textContent).toContain('Ambiguous query binding');
        expect(fetch.mock.calls[0][1]?.signal?.aborted).toBe(true);
        await act(async () => { pending.resolve(response({ name: 'Obsolete result' })); });
        act(() => { unregisterQueryIdentity('ProjectName', 'Other/ProjectName'); });
        expect(screen.getByRole('textbox')).toHaveProperty('value', '');
        expect(screen.queryByText('Obsolete result')).toBeNull();
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('accepts legacy registration replacement without making it ambiguous', async () => {
        clearBindings();
        registerQuery('ProjectName', AllProjects);
        registerQuery('ProjectName', ProjectName);
        render(view()); edit('legacy-id'); await submit();
        expect(await screen.findByText('Project result')).not.toBeNull();
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('replaces a mounted source identity on hot reload using the runtime cancellation contract', async () => {
        const pending = deferred(); fetch.mockReturnValueOnce(pending.promise);
        render(view()); edit('reload-id'); await submit();
        class Replacement extends ProjectName {}
        await act(async () => { registerQueryIdentity('ProjectName', 'Queries/ProjectName', Replacement); });
        expect(fetch.mock.calls[0][1]?.signal?.aborted).toBe(true);
        expect(await screen.findByText('Project result')).not.toBeNull();
        await act(async () => { pending.resolve(response({ name: 'Obsolete result' })); });
        expect(screen.queryByText('Obsolete result')).toBeNull();
        expect(fetch).toHaveBeenCalledTimes(2);
        expect(ArgumentsValidator.received[0]).toBe(ArgumentsValidator.received[1]);
    });

    it('includes optional empty strings verbatim and supports exact own names without prototype lookup', async () => {
        render(view({ inputs: [input, { parameter: 'toString', type: 'string', label: 'Optional input', required: false }] }));
        edit('some-id'); await submit();
        expect(await screen.findByText('Project result')).not.toBeNull();
        expect(ArgumentsValidator.received[0]).toEqual({ projectId: 'some-id', toString: '' });
        expect(new URL(String(fetch.mock.calls[0][0])).searchParams.get('toString')).toBe('');
    });

    it('still runs native required-argument validation when a declared optional string is empty', async () => {
        render(view({ inputs: [{ ...input, required: false }] }));
        await submit();
        expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Unable to load result');
        expect(fetch).not.toHaveBeenCalled();
    });

    it('allows an unchanged pending submission to be superseded by an explicit retry', async () => {
        const pending = deferred(); fetch.mockReturnValueOnce(pending.promise);
        render(view()); edit('retry-id'); await submit();
        await submit();
        expect(fetch.mock.calls[0][1]?.signal?.aborted).toBe(true);
        expect(await screen.findByText('Project result')).not.toBeNull();
        await act(async () => { pending.resolve(response({ name: 'Old attempt' })); });
        expect(screen.queryByText('Old attempt')).toBeNull();
        expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('rejects an enumerable proxy before native perform rather than falling back to a collection', async () => {
        render(view({ query: 'AllProjects' })); edit('not-used'); await submit();
        expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Unable to load result');
        expect(fetch).not.toHaveBeenCalled();
    });

    for (const inputs of [undefined, [], {}, [null], [{ ...input, type: 'number' }], [input, input], [{ ...input, parameter: '' }], [{ ...input, label: 7 }], [{ ...input, required: 'true' }], [{ ...input, pattern: '[' }], [{ ...input, pattern: 7 }]]) {
        it(`rejects malformed declarations ${JSON.stringify(inputs)} visibly without native execution`, () => {
            render(view({ inputs }));
            expect(screen.getByRole('alert').textContent).toBe('Invalid query input form configuration');
            expect(screen.queryByRole('textbox')).toBeNull();
            expect(fetch).not.toHaveBeenCalled();
            expect(ArgumentsValidator.received).toHaveLength(0);
        });
    }

    it('retains drafts across equivalent host rerenders but resets on a new declaration', async () => {
        const mounted = render(view()); edit('draft');
        mounted.rerender(view());
        expect(screen.getByRole('textbox')).toHaveProperty('value', 'draft');
        await submit();
        expect(await screen.findByText('Project result')).not.toBeNull();
        mounted.rerender(view({ inputs: [{ ...input, label: 'New identifier' }] }));
        expect(screen.getByRole('textbox')).toHaveProperty('value', '');
        expect(screen.queryByText('Project result')).toBeNull();
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('cancels and clears the session when the element is disabled', async () => {
        const pending = deferred(); fetch.mockReturnValueOnce(pending.promise);
        const mounted = render(view()); edit('first'); await submit();
        mounted.rerender(view({}, context, false));
        expect(fetch.mock.calls[0][1]?.signal?.aborted).toBe(true);
        await act(async () => { pending.resolve(response({ name: 'Obsolete result' })); });
        expect(screen.queryByText('Obsolete result')).toBeNull();
        mounted.rerender(view());
        expect(screen.getByRole('textbox')).toHaveProperty('value', '');
        expect(fetch).toHaveBeenCalledTimes(1);
    });
});
