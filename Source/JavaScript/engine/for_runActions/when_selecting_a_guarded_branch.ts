// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GuardCondition, GuardOperator, InteractionBinding, InteractionActionKind, InteractionTriggerKind } from '@cratis/scene.model';
import { runBindings } from '../runActions';
import { RecordingDispatcher } from './given/a_recording_dispatcher';

const condition: GuardCondition = { kind: 'comparison', left: { subject: 'item.id' }, operator: GuardOperator.Equal, right: 1 };
const command = (name: string) => ({ kind: InteractionActionKind.ExecuteCommand as const, command: name });
const binding = (overrides: Partial<InteractionBinding> = {}): InteractionBinding => ({
    trigger: { kind: InteractionTriggerKind.Click }, actions: [],
    alternatives: [{ condition, actions: [command('first'), command('second')] }, { condition, actions: [command('never')] }],
    otherwise: [command('fallback')], ...overrides,
});

async function run(value: InteractionBinding, subject: unknown = { id: 1 }, succeeds = true) {
    const dispatcher = new RecordingDispatcher();
    dispatcher.commandSucceeds = succeeds;
    let reads = 0;
    const result = await runBindings([{ level: 'test', behaviorName: 'test', binding: value }], dispatcher, { resolve: () => undefined, subject: () => { reads++; return subject; } });
    return { dispatcher, result, reads };
}

const corpus: { guardedBindingCases: { name: string; subject: unknown; binding: InteractionBinding; expectedCalls: string[] }[] } = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../interaction-fixtures.json'), 'utf8'));

describe('when selecting a guarded interaction branch', () => {
    for (const entry of corpus.guardedBindingCases) {
        it(`should satisfy shared case: ${entry.name}`, async () => {
            expect((await run(entry.binding, entry.subject)).dispatcher.calls).toEqual(entry.expectedCalls);
        });
    }
    it('should select once and run one entire action list', async () => {
        const { dispatcher, reads } = await run(binding());
        expect(dispatcher.calls).toEqual(['executeCommand:first:{}', 'executeCommand:second:{}']);
        expect(reads).toBe(1);
    });
    it('should run otherwise only after an evaluable no-match', async () => {
        expect((await run(binding(), { id: 2 })).dispatcher.calls).toEqual(['executeCommand:fallback:{}']);
    });
    it('should run nothing on no match without otherwise', async () => {
        expect((await run(binding({ otherwise: undefined }), { id: 2 })).dispatcher.calls).toEqual([]);
    });
    it('should run nothing without a subject, even with otherwise', async () => {
        expect((await run(binding(), null)).dispatcher.calls).toEqual([]);
    });
    it('should refuse unknown guards instead of running otherwise', async () => {
        const result = await run(binding({ alternatives: [{ condition: { kind: 'future' } as unknown as GuardCondition, actions: [command('never')] }] }));
        expect(result.dispatcher.calls).toEqual([]);
        expect(result.result.findings[0].kind).toBe('unevaluableCondition');
    });
    it('should reject ambiguous actions and alternatives', async () => {
        const result = await run(binding({ actions: [command('ambiguous')] }));
        expect(result.dispatcher.calls).toEqual([]);
        expect(result.result.findings[0].detail).toContain('SCENE-GUARD-001');
    });
    it('should not fall through after a failed selected command', async () => {
        expect((await run(binding(), { id: 1 }, false)).dispatcher.calls).toEqual(['executeCommand:first:{}', 'executeCommand:second:{}']);
    });
    it('should leave ordinary unguarded interactions unchanged', async () => {
        expect((await run(binding({ alternatives: undefined, actions: [command('ordinary')] }))).dispatcher.calls).toEqual(['executeCommand:ordinary:{}']);
    });
});
