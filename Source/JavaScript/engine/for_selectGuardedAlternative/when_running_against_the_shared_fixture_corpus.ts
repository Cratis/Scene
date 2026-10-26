// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GuardedActionFallback } from '@cratis/scene.model';
import { canEvaluateGuard, evaluateGuard, GuardSelection, selectGuardedAction, selectGuardedInteraction } from '../guards';

interface Corpus {
    interactions: { name: string; alternatives: { condition: unknown }[]; item: unknown; hasOtherwise: boolean; expected: GuardSelection }[];
    cases: { name: string; condition: unknown; item: unknown; evaluable: boolean; result: boolean | null }[];
    selections: { name: string; alternatives: { condition: unknown }[]; item: unknown; otherwise?: GuardedActionFallback; expected: GuardSelection }[];
}
const corpus: Corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../guarded-selection-fixtures.json'), 'utf8'));

describe('when evaluating the shared guard corpus', () => {
    for (const entry of corpus.cases) {
        it(`should evaluate ${entry.name}`, () => {
            expect(canEvaluateGuard(entry.condition)).toBe(entry.evaluable);
            expect(evaluateGuard(entry.condition, entry.item) ?? null).toBe(entry.result);
        });
    }
    for (const entry of corpus.interactions) {
        it(`should select interaction ${entry.name}`, () => {
            expect(selectGuardedInteraction(entry.alternatives, entry.item, entry.hasOtherwise)).toEqual(entry.expected);
        });
    }
    for (const entry of corpus.selections) {
        it(`should select ${entry.name}`, () => {
            expect(selectGuardedAction(entry.alternatives, entry.item, entry.otherwise)).toEqual(entry.expected);
        });
    }
});
