// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { externalComponent } from '../../given';

// This seam captures adapter inputs only. It does not simulate AutoCommandForm or its footer.
describe('when forwarding command forms to the lazy runtime', () => {
    const received = vi.fn<(props: Record<string, unknown>) => void>();
    const loaded = vi.fn();
    let bindings: typeof import('../../bindings/bindingRegistry');
    let Form: typeof import('../SceneCommandForm').SceneCommandForm;
    class Original {}
    class Replacement {}

    beforeEach(async () => {
        vi.resetModules();
        received.mockClear();
        loaded.mockClear();
        vi.doMock('../CommandFormRuntime', () => {
            loaded();
            return { default: (props: Record<string, unknown>) => { received(props); return <span>Runtime boundary</span>; } };
        });
        bindings = await import('../../bindings/bindingRegistry');
        bindings.clearBindings();
        ({ SceneCommandForm: Form } = await import('../SceneCommandForm'));
    });

    afterEach(() => {
        cleanup();
        bindings.clearBindings();
        vi.doUnmock('../CommandFormRuntime');
        vi.resetModules();
    });

    it('should preserve the exact registered constructor, exclusions and explicit label', async () => {
        bindings.registerCommand('RecordNote', Original);
        const exclude = ['internalValue'];
        await act(async () => { render(<Form element={externalComponent('Cratis.Components:commandForm', {
            command: 'RecordNote', exclude, submitLabel: 'Record note',
        })} slots={{}} />); });
        received.mock.calls.at(-1)![0].should.deep.equal({ command: Original, exclude, inputs: undefined, submitLabel: 'Record note' });
    });

    for (const submitLabel of [undefined, 42, false]) {
        it(`should default a missing or non-string label (${String(submitLabel)}) to Submit`, async () => {
            bindings.registerCommand('RecordNote', Original);
            await act(async () => { render(<Form element={externalComponent('Cratis.Components:commandForm', {
                command: 'RecordNote', exclude: 'not-an-array', submitLabel,
            })} slots={{}} />); });
            received.mock.calls.at(-1)![0].should.deep.equal({ command: Original, exclude: undefined, inputs: undefined, submitLabel: 'Submit' });
        });
    }

    it('should preserve legacy last-registration-wins command binding', async () => {
        bindings.registerCommand('RecordNote', Original);
        bindings.registerCommand('RecordNote', Replacement);
        await act(async () => { render(<Form element={externalComponent('Cratis.Components:commandForm', { command: 'RecordNote' })} slots={{}} />); });
        (received.mock.calls.at(-1)![0].command === Replacement).should.equal(true);
    });

    it('should keep an unbound preview Arc-free even when a query has that name', async () => {
        bindings.registerQuery('RecordNote', Original);
        await act(async () => { render(<Form element={externalComponent('Cratis.Components:commandForm', { command: 'RecordNote' })} slots={{}} />); });
        Boolean(screen.getByText("Unresolved command binding 'RecordNote' on Cratis.Components:commandForm")).should.equal(true);
        loaded.mock.calls.should.have.lengthOf(0);
    });
});
