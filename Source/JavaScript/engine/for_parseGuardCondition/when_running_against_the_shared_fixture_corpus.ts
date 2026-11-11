// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GuardCondition } from '@cratis/scene.model';
import { describeGuardCondition, parseGuardCondition } from '../guards';

interface Corpus {
    parse: { name: string; text: string; expected: unknown }[];
    describe: { name: string; condition: GuardCondition; text: string }[];
}
const corpus: Corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../guard-condition-text-fixtures.json'), 'utf8'));

describe('when reading the shared guard condition text corpus', () => {
    for (const entry of corpus.parse) {
        it(`should parse ${entry.name}`, () => {
            expect(JSON.stringify(parseGuardCondition(entry.text) ?? null)).toBe(JSON.stringify(entry.expected));
        });
    }
    for (const entry of corpus.describe) {
        it(`should describe ${entry.name}`, () => {
            expect(describeGuardCondition(entry.condition)).toBe(entry.text);
        });
    }
});
