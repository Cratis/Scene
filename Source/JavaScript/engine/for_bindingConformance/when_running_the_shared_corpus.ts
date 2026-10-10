// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BindingExpression } from '@cratis/scene.model';
import { BindingDiagnostic, BindingScope, QueryBindingState, QueryBindingTicket, nestBindingScope, removeComponentOutputs, resolveBindingExpression, validateBindingExpression } from '../index';

interface Step {
    nest?: BindingScope;
    remove?: string[];
    begin?: string;
    as?: string;
    complete?: string;
    result?: unknown;
    accepted?: boolean;
    clear?: string;
    resolve?: BindingExpression;
    expected?: unknown;
    expectedAbsent?: boolean;
    validate?: BindingExpression;
    targetElementId?: string;
    resolvingElementIds?: string[];
    expectedDiagnostics?: BindingDiagnostic[];
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../binding-resolution-fixtures.json'), 'utf-8')) as {
    scenarios: { name: string; scope: BindingScope; steps: Step[] }[];
};

/** Runs a scenario and returns one line per step, in the shape the C# spec also produces. */
function run(scope: BindingScope, steps: Step[]): string[] {
    const queries = new QueryBindingState();
    const tickets = new Map<string, QueryBindingTicket>();
    const effective = () => ({ ...scope, queryResults: { ...(scope.queryResults ?? {}), ...queries.queryResults } });

    return steps.map((step, index) => {
        if (step.nest) scope = nestBindingScope(scope, step.nest);
        else if (step.remove) scope = removeComponentOutputs(scope, step.remove);
        else if (step.begin) tickets.set(step.as!, queries.begin(step.begin));
        else if (step.complete) return `${index}: accepted ${queries.complete(tickets.get(step.complete)!, step.result)}`;
        else if (step.clear) queries.clear(step.clear);
        else if (step.resolve) {
            const value = resolveBindingExpression(step.resolve, effective());
            return `${index}: ${value === undefined ? 'absent' : JSON.stringify(value)}`;
        } else if (step.validate) {
            const diagnostics = validateBindingExpression(step.validate, effective(), { targetElementId: step.targetElementId, resolvingElementIds: step.resolvingElementIds });
            return `${index}: ${JSON.stringify(diagnostics.map(diagnostic => [diagnostic.code, diagnostic.message, diagnostic.path]))}`;
        }
        return `${index}: ok`;
    });
}

function expectations(steps: Step[]): string[] {
    return steps.map((step, index) => {
        if (step.complete) return `${index}: accepted ${step.accepted}`;
        if (step.resolve) return `${index}: ${step.expectedAbsent ? 'absent' : JSON.stringify(step.expected)}`;
        if (step.validate) return `${index}: ${JSON.stringify(step.expectedDiagnostics!.map(diagnostic => [diagnostic.code, diagnostic.message, diagnostic.path]))}`;
        return `${index}: ok`;
    });
}

describe('when running the shared binding corpus', () => {
    it('should exercise every source kind, null behavior, cycle, lifecycle and rebind step', () => {
        const steps = corpus.scenarios.flatMap(scenario => scenario.steps);
        ['resolve', 'validate', 'nest', 'remove', 'begin', 'complete', 'clear'].every(kind => steps.some(step => kind in step)).should.equal(true);
    });

    for (const scenario of corpus.scenarios) {
        it(`should produce the shared results for ${scenario.name}`, () =>
            run(structuredClone(scenario.scope), scenario.steps).should.deep.equal(expectations(scenario.steps)));
    }
});
