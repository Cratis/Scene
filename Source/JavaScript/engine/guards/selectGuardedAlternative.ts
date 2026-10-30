// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { GuardedActionFallbackOutcome } from '@cratis/scene.model';
import { canEvaluateGuard, evaluateGuard } from './evaluateGuardCondition';
import { GuardEvaluationOptions } from './GuardEvaluationOptions';

export type GuardSelection = { kind: 'alternative'; index: number } | { kind: 'otherwise' | 'hidden' | 'noSubject' | 'unevaluable' | 'unmatched' };

function record(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function selectGuardedInteraction(alternatives: readonly unknown[], item: unknown, hasOtherwise = false, options?: GuardEvaluationOptions): GuardSelection {
    if (!record(item)) return { kind: 'noSubject' };
    if (alternatives.some(alternative => !record(alternative) || !canEvaluateGuard(alternative.condition, options))) return { kind: 'unevaluable' };
    const results = alternatives.map(alternative => record(alternative) ? evaluateGuard(alternative.condition, item, options) : undefined);
    if (results.some(result => result === undefined)) return { kind: 'unevaluable' };
    const index = results.findIndex(result => result === true);
    if (index >= 0) return { kind: 'alternative', index };
    return { kind: hasOtherwise ? 'otherwise' : 'unmatched' };
}

export function selectGuardedAction(alternatives: readonly unknown[], item: unknown, otherwise?: { outcome: GuardedActionFallbackOutcome }, options?: GuardEvaluationOptions): GuardSelection {
    const result = selectGuardedInteraction(alternatives, item, otherwise?.outcome === GuardedActionFallbackOutcome.Execute, options);
    return result.kind === 'unmatched' ? { kind: 'hidden' } : result;
}
