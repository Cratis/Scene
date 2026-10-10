// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BindingScope, resolveArgumentSource } from '../index';

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../argument-source-fixtures.json'), 'utf-8')) as {
    scope: BindingScope;
    cases: { source: string; expected?: unknown; expectedAbsent?: boolean }[];
};

describe('when resolving command argument sources from the shared corpus', () => {
    for (const { source, expected, expectedAbsent } of corpus.cases) {
        it(`should resolve '${source}' like the C# engine`, () => {
            const value = resolveArgumentSource(source, corpus.scope);
            (value === undefined ? 'absent' : JSON.stringify(value)).should.equal(expectedAbsent ? 'absent' : JSON.stringify(expected));
        });
    }
});
