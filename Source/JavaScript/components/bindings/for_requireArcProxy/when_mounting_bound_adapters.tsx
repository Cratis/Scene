// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, render, screen } from '@testing-library/react';
import { expect, vi } from 'vitest';
import { externalComponent } from '../../given';

// Keep the real Arc base classes; replace only the final Components renderers.
describe('when mounting bound adapters', () => {
    const received = vi.fn<(props: Record<string, unknown>) => void>();
    let bindings: typeof import('../bindingRegistry');
    let proxies: typeof import('./NativeProxies');
    let adapters: typeof import('../ArcBoundComponents');
    let Boundary: typeof import('../ArcRuntimeBoundary').ArcRuntimeBoundary;

    beforeEach(async () => {
        vi.resetModules();
        received.mockClear();
        const component = (props: Record<string, unknown>) => { received(props); return <span>Mounted native adapter</span>; };
        vi.doMock('@cratis/components/DataTables', () => ({ DataTableForQuery: component, DataTableForObservableQuery: component }));
        vi.doMock('@cratis/components/DataPage', () => ({ DataPage: component }));
        vi.doMock('@cratis/components/CommandDialog', () => ({ CommandDialog: component, StepperCommandDialog: component }));
        bindings = await import('../bindingRegistry');
        bindings.clearBindings();
        proxies = await import('./NativeProxies');
        adapters = await import('../ArcBoundComponents');
        ({ ArcRuntimeBoundary: Boundary } = await import('../ArcRuntimeBoundary'));
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        cleanup();
        bindings.clearBindings();
        vi.restoreAllMocks();
        vi.doUnmock('@cratis/components/DataTables');
        vi.doUnmock('@cratis/components/DataPage');
        vi.doUnmock('@cratis/components/CommandDialog');
        vi.resetModules();
    });

    it('should pass both supported page kinds and both command dialog constructors unchanged', () => {
        const { BoundDataPage, BoundObservableDataTable, BoundCommandDialog, BoundStepperCommandDialog } = adapters;
        render(<><BoundDataPage query={proxies.Snapshot} title='' emptyMessage='' children={undefined} />
            <BoundDataPage query={proxies.Live} title='' emptyMessage='' children={undefined} />
            <BoundObservableDataTable query={proxies.Live} emptyMessage='' />
            <BoundCommandDialog command={proxies.Save} title='' visible />
            <BoundStepperCommandDialog command={proxies.Save} title='' visible /></>);
        expect(received.mock.calls.map(([props]) => props.query ?? props.command)).toEqual([proxies.Snapshot, proxies.Live, proxies.Live, proxies.Save, proxies.Save]);
    });

    it('should visibly reject a wrong-kind registered query without selecting another query', async () => {
        bindings.registerQuery('wrong', proxies.Save);
        bindings.registerQuery('valid', proxies.Snapshot);
        const { SceneDataTable } = await import('../../data/SceneDataTable');
        await act(async () => {
            render(<SceneDataTable element={externalComponent('Cratis.Components:dataTable', { query: 'wrong' })} slots={{}} />);
        });
        // The published Components boundary sanitizes exception text; assert visible failure, not
        // its former raw-error presentation. requireArcProxy's specs cover the precise diagnostic.
        expect(screen.getByRole('alert')).toBeTruthy();
        expect(received).not.toHaveBeenCalled();
    });

    it('should visibly reject snapshot bindings in observable tables and query bindings in dialogs', () => {
        const { BoundObservableDataTable, BoundCommandDialog, BoundStepperCommandDialog, BoundDataPage } = adapters;
        render(<><Boundary><BoundObservableDataTable query={proxies.Snapshot} emptyMessage='' /></Boundary>
            <Boundary><BoundCommandDialog command={proxies.Snapshot} title='' visible /></Boundary>
            <Boundary><BoundStepperCommandDialog command={proxies.Live} title='' visible /></Boundary>
            <Boundary><BoundDataPage query={proxies.Save} title='' emptyMessage='' children={undefined} /></Boundary></>);
        expect(screen.getAllByRole('alert')).toHaveLength(4);
        expect(received).not.toHaveBeenCalled();
    });
});
