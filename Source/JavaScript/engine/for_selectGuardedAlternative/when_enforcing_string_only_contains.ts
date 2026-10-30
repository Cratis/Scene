// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { GuardedActionFallbackOutcome, GuardOperator } from '@cratis/scene.model';
import { canEvaluateGuard, evaluateGuard, selectGuardedAction, selectGuardedInteraction } from '../guards';

const strict = { strictOperands: true };
const contains = (right: unknown = 'open') => ({ kind: 'comparison', left: { subject: 'item.value' }, operator: GuardOperator.Contains, right });
const equal = { kind: 'comparison', left: { subject: 'item.id' }, operator: GuardOperator.Equal, right: 1 };
const alternatives = (condition: unknown) => [{ condition }];

describe('when enforcing string-only contains', () => {
    for (const item of [{ value: ['open'] }, { value: 123 }, { value: true }, { value: {} }]) {
        it(`should refuse the non-string field ${JSON.stringify(item)} without otherwise`, () => {
            expect(evaluateGuard(contains(), item, strict)).toBeUndefined();
            expect(selectGuardedInteraction(alternatives(contains()), item, true, strict)).toEqual({ kind: 'unevaluable' });
        });
    }
    // Screenplay Documentation/screenplay/screens.md:86–90: null or missing fields make comparisons false.
    for (const item of [{ value: null }, {}]) {
        it(`should evaluate ${JSON.stringify(item)} as false and allow otherwise`, () => {
            expect(evaluateGuard(contains(), item, strict)).toBe(false);
            expect(selectGuardedInteraction(alternatives(contains()), item, true, strict)).toEqual({ kind: 'otherwise' });
            expect(selectGuardedAction(alternatives(contains()), item, { outcome: GuardedActionFallbackOutcome.Execute }, strict)).toEqual({ kind: 'otherwise' });
        });
    }
    for (const literal of [1, 2, true, null, [], {}]) {
        it(`should reject the literal ${JSON.stringify(literal)} statically`, () => {
            expect(canEvaluateGuard(contains(literal), strict)).toBe(false);
            expect(selectGuardedInteraction(alternatives(contains(literal)), { value: [1] }, true, strict)).toEqual({ kind: 'unevaluable' });
            expect(selectGuardedInteraction(alternatives(contains(literal)), {}, true, strict)).toEqual({ kind: 'unevaluable' });
        });
    }
    it('should propagate an invalid contains through a true disjunction', () => {
        const condition = { kind: 'logical', operator: 'Or', left: contains(), right: equal };
        expect(evaluateGuard(condition, { value: ['open'], id: 1 }, strict)).toBeUndefined();
    });
    it('should refuse a later unevaluable alternative even after a match', () => {
        expect(selectGuardedInteraction([{ condition: equal }, { condition: contains() }], { id: 1, value: ['open'] }, true, strict)).toEqual({ kind: 'unevaluable' });
    });
    it('should select string substrings and otherwise for string misses', () => {
        expect(selectGuardedInteraction(alternatives(contains()), { value: 'reopened' }, true, strict)).toEqual({ kind: 'alternative', index: 0 });
        expect(selectGuardedInteraction(alternatives(contains()), { value: 'closed' }, true, strict)).toEqual({ kind: 'otherwise' });
    });
    it('should refuse a guarded action instead of hiding or executing otherwise', () => {
        expect(selectGuardedAction(alternatives(contains()), { value: ['open'] }, { outcome: GuardedActionFallbackOutcome.Execute }, strict)).toEqual({ kind: 'unevaluable' });
    });
    it('should leave null equality unchanged', () => {
        const condition = { ...contains(null), operator: GuardOperator.Equal };
        expect(selectGuardedInteraction(alternatives(condition), { value: null }, true, strict)).toEqual({ kind: 'alternative', index: 0 });
        expect(selectGuardedInteraction(alternatives(condition), {}, true, strict)).toEqual({ kind: 'otherwise' });
    });
    for (const entry of [
        { item: { value: [1] }, condition: contains(1), expected: { kind: 'alternative', index: 0 } },
        { item: { value: ['open'] }, condition: contains(), expected: { kind: 'alternative', index: 0 } },
        { item: { value: 123 }, condition: contains(), expected: { kind: 'otherwise' } },
    ]) {
        it(`should preserve generic semantics for ${JSON.stringify(entry.item)}`, () => {
            expect(selectGuardedInteraction(alternatives(entry.condition), entry.item, true)).toEqual(entry.expected);
            expect(selectGuardedInteraction(alternatives(entry.condition), entry.item, true, strict)).toEqual({ kind: 'unevaluable' });
        });
    }
});
