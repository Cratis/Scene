// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, render, screen } from '@testing-library/react';
import { expect, vi } from 'vitest';
import { externalComponent } from '../../given';

describe('when previewing bound adapters without Arc', () => {
    const loaded = vi.fn();

    afterEach(() => {
        cleanup();
        vi.doUnmock('../ArcBoundComponents');
        vi.resetModules();
    });

    it('should show missing bindings without importing the Arc runtime module', async () => {
        vi.resetModules();
        vi.doMock('../ArcBoundComponents', () => {
            loaded();
            throw new Error('Arc is unavailable in preview');
        });
        const { clearBindings } = await import('../bindingRegistry');
        clearBindings();
        const { SceneDataTable } = await import('../../data/SceneDataTable');
        const { SceneObservableDataTable } = await import('../../data/SceneObservableDataTable');
        const { SceneDataPage } = await import('../../pages/SceneDataPage');
        const { SceneCommandDialog } = await import('../../dialogs/SceneCommandDialog');
        const { SceneStepperCommandDialog } = await import('../../dialogs/SceneStepperCommandDialog');
        await act(async () => {
            render(<>{[SceneDataTable, SceneObservableDataTable, SceneDataPage, SceneCommandDialog, SceneStepperCommandDialog].map((Adapter, index) =>
                <Adapter key={index} element={externalComponent('Cratis.Components:preview', { query: 'missing', command: 'missing' })} slots={{}} />)}</>);
        });
        expect(screen.getAllByText(/Unresolved .* binding 'missing'/)).toHaveLength(5);
        expect(loaded).not.toHaveBeenCalled();
    });
});
