// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { Command } from '@cratis/arc/commands';
import { PropertyDescriptor } from '@cratis/arc/reflection';
import { ArcContext } from '@cratis/arc.react';
import { SceneElementView } from '@cratis/scene.react';
import { clearBindings, registerCommand } from '../../bindings';
import { cratisComponents } from '../../cratisComponents';
import { externalComponent } from '../../given';

interface ParityCase {
    name: string;
    command: { name: string; route: string; properties: { name: string; type: string; required: boolean }[] };
    form: { generationMode: 'auto' | 'manual'; fields?: { name: string; label?: string }[]; layout?: unknown };
    input: Record<string, string>;
    expected: { labels: string[]; emptySubmitMessages: string[]; requestsOnEmptySubmit: number; payload: Record<string, unknown> };
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../../command-form-parity-fixtures.json'), 'utf-8')) as { cases: ParityCase[] };

/** The Arc command a generated app gets for the fixture's schema - the same shape Stage's runtime builds. */
function commandFor(fixture: ParityCase['command']) {
    const descriptors = fixture.properties.map(property => new PropertyDescriptor(property.name, String, !property.required));
    return class FixtureCommand extends Command<Record<string, unknown>, object> {
        readonly route = fixture.route.replace(/^\//, '');
        readonly propertyDescriptors = descriptors;
        get requestParameters(): string[] { return []; }
        constructor() {
            super(Object, false);
            for (const descriptor of descriptors) {
                let value: unknown;
                Object.defineProperty(this, descriptor.name, {
                    configurable: true, enumerable: true,
                    get: () => value,
                    set: next => { value = next; this.propertyChanged(descriptor.name); },
                });
            }
        }
    };
}

/** How Scene authors the fixture's form: auto mode, or manual inputs in the fixture's field order with its layout. */
function sceneProperties(fixture: ParityCase): Record<string, unknown> {
    if (fixture.form.generationMode === 'auto') return { command: fixture.command.name, mode: 'auto', submitLabel: 'Execute' };
    return {
        command: fixture.command.name, mode: 'manual', submitLabel: 'Execute', layout: fixture.form.layout,
        inputs: fixture.form.fields!.map(field => ({ property: field.name, type: 'string', label: field.label ?? field.name })),
    };
}

describe('when running the shared command form parity corpus', () => {
    afterEach(() => { cleanup(); clearBindings(); vi.unstubAllGlobals(); });

    for (const fixture of corpus.cases) {
        it(`should observe the shared fields, validation and payload for the ${fixture.name}`, async () => {
            clearBindings();
            registerCommand(fixture.command.name, commandFor(fixture.command));
            const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async () => new Response(JSON.stringify({
                isSuccess: true, isAuthorized: true, isValid: true, hasExceptions: false, validationResults: [], exceptionMessages: [], exceptionStackTrace: '', response: {},
            }), { status: 200, headers: { 'content-type': 'application/json' } }));
            vi.stubGlobal('fetch', fetch);

            render(<ArcContext.Provider value={{ origin: 'https://example.test', apiBasePath: '', microservice: 'customers', httpHeadersCallback: () => ({}) }}>
                <SceneElementView element={externalComponent('Cratis.Components:commandForm', sceneProperties(fixture))} registry={cratisComponents} resolveBinding={() => undefined} />
            </ArcContext.Provider>);

            const execute = await screen.findByRole<HTMLButtonElement>('button', { name: 'Execute' });
            const boxes = screen.getAllByRole<HTMLInputElement>('textbox');
            const labels = boxes.map(box => (box.labels?.[0]?.textContent ?? box.getAttribute('aria-label') ?? '').trim());

            await act(async () => { fireEvent.submit(execute.form!); });
            await waitFor(() => screen.getAllByText(/ is required$/).length.should.be.greaterThan(0));
            const messages = [...new Set(screen.getAllByText(/ is required$/).map(message => message.textContent!))].sort();
            const requestsOnEmptySubmit = fetch.mock.calls.length;

            boxes.forEach((box, index) => fireEvent.change(box, { target: { value: fixture.input[box.name || Object.keys(fixture.input)[index]] } }));
            await act(async () => { fireEvent.submit(execute.form!); });
            await waitFor(() => fetch.mock.calls.should.have.lengthOf(1));

            ({ labels, emptySubmitMessages: messages, requestsOnEmptySubmit, payload: JSON.parse(String(fetch.mock.calls[0][1]!.body)) })
                .should.deep.equal(fixture.expected);
        });
    }
});
