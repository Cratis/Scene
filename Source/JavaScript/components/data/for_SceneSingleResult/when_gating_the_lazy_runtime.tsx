// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, render, screen } from '@testing-library/react';
import { expect, vi } from 'vitest';
import { externalComponent } from '../../given';

class RegisteredQuery {}

describe('when gating the single result lazy runtime', () => {
    const loaded = vi.fn();
    let SceneSingleResult: typeof import('../SceneSingleResult').SceneSingleResult;
    let bindings: typeof import('../../bindings');

    beforeEach(async () => {
        vi.resetModules();
        loaded.mockClear();
        vi.doMock('../SingleResultRuntime', () => {
            loaded();
            return { default: () => <span>Runtime mounted</span> };
        });
        bindings = await import('../../bindings');
        bindings.clearBindings();
        bindings.registerQuery('Registered', RegisteredQuery);
        ({ SceneSingleResult } = await import('../SceneSingleResult'));
    });

    afterEach(() => {
        cleanup();
        bindings.clearBindings();
        vi.doUnmock('../SingleResultRuntime');
        vi.resetModules();
    });

    for (const properties of [
        { query: 'Missing', enabled: true, queryArguments: {}, resultField: 'name' },
        { query: 'Registered', queryArguments: {}, resultField: 'name' },
        { query: 'Registered', enabled: true, queryArguments: [], resultField: 'name' },
        { query: 'Registered', enabled: true, queryArguments: {}, resultField: '' },
    ]) {
        it(`does not import Arc-bound code for ${JSON.stringify(properties)}`, async () => {
            await act(async () => {
                render(<SceneSingleResult element={externalComponent('Cratis.Components:singleResult', properties)} slots={{}} />);
            });
            expect(loaded).not.toHaveBeenCalled();
            expect(screen.queryByText('Runtime mounted')).toBeNull();
            expect(document.body.textContent).toMatch(/Unresolved query binding|Idle|Unable to load result/);
        });
    }

    it('loads only the explicitly bound and enabled view', async () => {
        await act(async () => {
            render(<SceneSingleResult element={externalComponent('Cratis.Components:singleResult', {
                query: 'Registered', enabled: true, queryArguments: {}, resultField: 'name',
            })} slots={{}} />);
        });
        expect(await screen.findByText('Runtime mounted')).not.toBeNull();
        expect(loaded).toHaveBeenCalledTimes(1);
    });
});
