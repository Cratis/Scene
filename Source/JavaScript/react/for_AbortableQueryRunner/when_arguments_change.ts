// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { AbortableQueryRunner } from '../renderer';

describe('when arguments change', () => {
    it('should abort stale work and only return the latest result', async () => {
        const runner = new AbortableQueryRunner();
        const signals: AbortSignal[] = [];
        const first = runner.run('Invoices', { id: 'first' }, async (_query, _argumentsValue, signal) => {
            signals.push(signal);
            await new Promise(resolve => setTimeout(resolve, 5));
            return 'first';
        });
        const second = runner.run('Invoices', { id: 'second' }, async (_query, _argumentsValue, signal) => {
            signals.push(signal);
            return 'second';
        });

        (await second)!.should.equal('second');
        ((await first) === undefined).should.equal(true);
        signals[0].aborted.should.equal(true);
    });
});
