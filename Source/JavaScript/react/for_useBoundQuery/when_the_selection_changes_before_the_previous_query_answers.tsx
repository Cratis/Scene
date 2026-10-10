// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { useBoundQuery } from '../renderer/useBoundQuery';

/** A query whose answers the spec releases by hand, in any order. */
function controllableQuery() {
    const pending: { invoice: string; signal: AbortSignal; resolve: (value: unknown) => void; reject: (error: Error) => void }[] = [];
    const perform = (_: string, argumentsValue: unknown, signal: AbortSignal) =>
        new Promise<unknown>((resolve, reject) => pending.push({ invoice: (argumentsValue as { invoice: string }).invoice, signal, resolve, reject }));
    return { perform, pending };
}

let select: (invoice: string | undefined) => void;

function Comments({ perform }: { perform: ReturnType<typeof controllableQuery>['perform'] }) {
    const [invoice, setInvoice] = useState<string | undefined>('INV-1');
    select = setInvoice;
    const results = useBoundQuery('comments', invoice === undefined ? undefined : { invoice }, perform);
    return <output>{JSON.stringify(results.comments ?? 'none')}</output>;
}

describe('when the selection changes before the previous query answers', () => {
    it('should discard the stale answer and abort its run', async () => {
        const query = controllableQuery();
        render(<Comments perform={query.perform} />);
        act(() => select('INV-2'));

        await act(async () => { query.pending[1].resolve(['about INV-2']); });
        await act(async () => { query.pending[0].resolve(['about INV-1']); });

        query.pending[0].signal.aborted.should.equal(true);
        screen.getByRole('status').textContent!.should.equal('["about INV-2"]');
    });

    it('should clear the result when the selection is cleared, and ignore a late answer', async () => {
        const query = controllableQuery();
        render(<Comments perform={query.perform} />);
        await act(async () => { query.pending[0].resolve(['about INV-1']); });
        screen.getByRole('status').textContent!.should.equal('["about INV-1"]');

        act(() => select('INV-2'));
        act(() => select(undefined));
        await act(async () => { query.pending[1].resolve(['about INV-2']); });
        screen.getByRole('status').textContent!.should.equal('"none"');
    });

    it('should not keep the previous selection\'s data when the rebind fails', async () => {
        const query = controllableQuery();
        render(<Comments perform={query.perform} />);
        await act(async () => { query.pending[0].resolve(['about INV-1']); });

        act(() => select('INV-2'));
        await act(async () => { query.pending[1].reject(new Error('offline')); });
        screen.getByRole('status').textContent!.should.equal('"none"');
    });
});
