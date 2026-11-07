// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletSubject } from '@cratis/scene.model';
import { evaluateGuard } from '../guards/evaluateGuardCondition';
import { Enablement, EnablementCheck, EnablementOutcome, EnablementRequest, EnablementState, EnablementStep } from './Enablement';

function subjectStep(request: EnablementRequest): EnablementStep | undefined {
    if (String(request.subject ?? '').toLowerCase() !== OutletSubject.Item) return undefined;
    return request.selected === true
        ? { check: EnablementCheck.Subject, outcome: EnablementOutcome.Passed, reason: 'An item is selected' }
        : { check: EnablementCheck.Subject, outcome: EnablementOutcome.Blocked, reason: 'It is for item, so it waits for a selection' };
}

function authorizationStep(request: EnablementRequest): EnablementStep | undefined {
    const policy = request.authorize;
    if (policy === undefined || policy.length === 0) return undefined;
    const persona = request.persona;
    if (persona === undefined) {
        return { check: EnablementCheck.Authorization, outcome: EnablementOutcome.Unchecked, reason: `The command authorizes with '${policy}', and no persona is given to check it against` };
    }
    return persona.policies.includes(policy)
        ? { check: EnablementCheck.Authorization, outcome: EnablementOutcome.Passed, reason: `${persona.name} has '${policy}'` }
        : { check: EnablementCheck.Authorization, outcome: EnablementOutcome.Blocked, reason: `${persona.name} does not have '${policy}', which the command authorizes with` };
}

function conditionStep(request: EnablementRequest): EnablementStep | undefined {
    if (request.enabledWhen === undefined && request.condition === undefined && request.conditionHolds === undefined) return undefined;
    const expression = request.enabledWhen ?? 'its condition';
    const holds = request.conditionHolds
        ?? (request.condition !== undefined && request.item !== undefined ? evaluateGuard(request.condition, request.item) : undefined);
    if (holds === undefined) {
        return { check: EnablementCheck.Condition, outcome: EnablementOutcome.Unchecked, reason: `Enabled when ${expression}, which cannot be checked here` };
    }
    return holds
        ? { check: EnablementCheck.Condition, outcome: EnablementOutcome.Passed, reason: `${expression} holds` }
        : { check: EnablementCheck.Condition, outcome: EnablementOutcome.Blocked, reason: `Enabled when ${expression}, which does not hold` };
}

/**
 * Works out whether an action can be used, and why. The C# engine answers the same (`EnablementResolver.Resolve`).
 *
 * It checks, in order: the subject (an action for an item waits for a selection), the command's authorization (a persona
 * without its policy does not see the action), and the action's `enabled when` condition. Every check is reported. A
 * blocked authorization hides the action whatever else holds, since the persona never sees it; otherwise the first blocked
 * check disables it. A check that cannot be made here - no persona, or a condition with nothing to evaluate it against -
 * does not hold the action back.
 * @param request The action's subject, authorization and condition, and the state they are checked against.
 * @returns Whether the action is enabled, disabled or hidden, why, and every check made.
 */
export function resolveEnablement(request: EnablementRequest): Enablement {
    const steps = [subjectStep(request), authorizationStep(request), conditionStep(request)].filter((step): step is EnablementStep => step !== undefined);
    const hidden = steps.find(step => step.check === EnablementCheck.Authorization && step.outcome === EnablementOutcome.Blocked);
    if (hidden !== undefined) return { state: EnablementState.Hidden, reason: hidden.reason, steps };
    const blocked = steps.find(step => step.outcome === EnablementOutcome.Blocked);
    if (blocked !== undefined) return { state: EnablementState.Disabled, reason: blocked.reason, steps };
    return { state: EnablementState.Enabled, reason: 'Enabled', steps };
}
