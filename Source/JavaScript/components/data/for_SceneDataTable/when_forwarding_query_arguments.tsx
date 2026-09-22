// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { externalComponent } from '../../given';

let InvoicesForProject: typeof import('../../bindings/for_requireArcProxy/NativeProxies').Snapshot;
let AnotherQuery: typeof InvoicesForProject;

// Load a fresh adapter so its lazy component cannot leak the peer double into other specs.
describe('when forwarding query arguments', () => {
    const suppliedId = 'project-with-an-explicit-id';
    const received = vi.fn<(properties: Record<string, unknown>) => void>();
    let SceneDataTable: typeof import('../SceneDataTable').SceneDataTable;
    let bindings: typeof import('../../bindings');

    beforeEach(async () => {
        vi.resetModules();
        received.mockClear();
        vi.doMock('@cratis/components/DataTables', () => ({
            DataTableForQuery: (properties: Record<string, unknown>) => {
                received(properties);
                return <div data-testid='query-table' />;
            },
        }));
        ({ Snapshot: InvoicesForProject } = await import('../../bindings/for_requireArcProxy/NativeProxies'));
        AnotherQuery = InvoicesForProject;
        bindings = await import('../../bindings');
        bindings.clearBindings();
        bindings.registerQuery('InvoicesForProject', InvoicesForProject);
        bindings.registerQuery('AnotherQuery', AnotherQuery);
        ({ SceneDataTable } = await import('../SceneDataTable'));
    });

    afterEach(() => {
        cleanup();
        bindings.clearBindings();
        vi.doUnmock('@cratis/components/DataTables');
        vi.resetModules();
    });

    async function renderTable(properties: Record<string, unknown>) {
        const element = externalComponent('Cratis.Components:dataTable', properties);
        await act(async () => {
            render(<SceneDataTable element={element} slots={{}} />);
        });
    }

    it('should pass the exact registered constructor and explicit projectId object through the runtime boundary', async () => {
        const queryArguments = { projectId: suppliedId };
        await renderTable({ query: 'InvoicesForProject', queryArguments });
        await screen.findByTestId('query-table');
        const properties = received.mock.lastCall![0];
        (properties.query === InvoicesForProject).should.equal(true);
        (properties.queryArguments === queryArguments).should.equal(true);
        properties.should.have.property('queryArguments').that.deep.equals({ projectId: suppliedId });
    });

    it('should bridge an identity-only query to an existing table without a second legacy registration', async () => {
        bindings.clearBindings();
        bindings.registerQueryIdentity('InvoicesForProject', 'Invoices/ForProject', InvoicesForProject);
        const queryArguments = { projectId: suppliedId };
        await renderTable({ query: 'InvoicesForProject', queryArguments });
        await screen.findByTestId('query-table');
        (received.mock.lastCall![0].query === InvoicesForProject).should.equal(true);
        (received.mock.lastCall![0].queryArguments === queryArguments).should.equal(true);
    });

    it('should visibly reject ambiguous identity-only tables without selecting either native proxy', async () => {
        bindings.clearBindings();
        bindings.registerQueryIdentity('InvoicesForProject', 'One/ForProject', InvoicesForProject);
        bindings.registerQueryIdentity('InvoicesForProject', 'Two/ForProject', AnotherQuery);
        await renderTable({ query: 'InvoicesForProject' });
        (screen.getByText("Unresolved query binding 'InvoicesForProject' on Cratis.Components:dataTable") !== null).should.equal(true);
        received.mock.calls.should.have.lengthOf(0);
    });

    it('should preserve all supplied keys and values without normalization or defaults', async () => {
        const queryArguments = { projectId: suppliedId, ProjectID: 'distinct', limit: 0, enabled: false, optional: null, filter: { names: ['one'] } };
        await renderTable({ query: 'InvoicesForProject', queryArguments });
        await screen.findByTestId('query-table');
        (received.mock.lastCall![0].queryArguments === queryArguments).should.equal(true);
    });

    it('should leave omitted arguments absent from the underlying component props', async () => {
        await renderTable({ query: 'InvoicesForProject' });
        await screen.findByTestId('query-table');
        Object.prototype.hasOwnProperty.call(received.mock.lastCall![0], 'queryArguments').should.equal(false);
        (received.mock.lastCall![0].query === InvoicesForProject).should.equal(true);
    });

    it('should treat undefined arguments as omitted like the existing property readers', async () => {
        await renderTable({ query: 'InvoicesForProject', queryArguments: undefined });
        await screen.findByTestId('query-table');
        Object.prototype.hasOwnProperty.call(received.mock.lastCall![0], 'queryArguments').should.equal(false);
    });

    it('should pass an explicitly empty argument object unchanged', async () => {
        const queryArguments = {};
        await renderTable({ query: 'InvoicesForProject', queryArguments });
        await screen.findByTestId('query-table');
        (received.mock.lastCall![0].queryArguments === queryArguments).should.equal(true);
    });

    for (const queryArguments of [[], ['project'], 'project', '{"projectId":"project"}', 42, false, null]) {
        it(`should visibly reject ${JSON.stringify(queryArguments)} without mounting a query table`, async () => {
            await renderTable({ query: 'InvoicesForProject', queryArguments });
            (screen.getByText("Invalid queryArguments: expected an object on Cratis.Components:dataTable") !== null).should.equal(true);
            received.mock.calls.should.have.lengthOf(0);
            (screen.queryByTestId('query-table') === null).should.equal(true);
        });
    }

    for (const queryArguments of [{ projectId: suppliedId }, null, []]) {
        it(`should retain MissingBinding precedence and never choose another registered query with ${JSON.stringify(queryArguments)}`, async () => {
            await renderTable({ query: 'UnregisteredQuery', queryArguments });
            (screen.getByText("Unresolved query binding 'UnregisteredQuery' on Cratis.Components:dataTable") !== null).should.equal(true);
            received.mock.calls.should.have.lengthOf(0);
            (screen.queryByText(/Invalid queryArguments/) === null).should.equal(true);
        });
    }
});
