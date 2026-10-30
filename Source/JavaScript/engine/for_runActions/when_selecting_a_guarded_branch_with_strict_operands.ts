// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExecuteCommandAction, GuardOperator, InteractionBinding, InteractionActionKind, InteractionTriggerKind } from '@cratis/scene.model';
import { runBindings } from '../runActions';
import { RecordingDispatcher } from './given/a_recording_dispatcher';

const binding: InteractionBinding = {
    trigger: { kind: InteractionTriggerKind.Click }, actions: [],
    alternatives: [{
        condition: { kind: 'comparison', left: { subject: 'item.tags' }, operator: GuardOperator.Contains, right: 'approved' },
        actions: [{ kind: InteractionActionKind.ExecuteCommand, command: 'Selected' } as ExecuteCommandAction],
    }],
    otherwise: [{ kind: InteractionActionKind.ExecuteCommand, command: 'Fallback' } as ExecuteCommandAction],
};

async function run(tags: unknown, strictOperands?: boolean) {
    const dispatcher = new RecordingDispatcher();
    const result = await runBindings([{ level: 'test', behaviorName: 'test', binding }], dispatcher, {
        resolve: () => undefined, subject: () => ({ tags }), guards: strictOperands === undefined ? undefined : { strictOperands },
    });
    return { dispatcher, result };
}

describe('when selecting a guarded branch with strict operands', () => {
    it('should report an array operand without running any branch', async () => {
        const { dispatcher, result } = await run(['approved'], true);
        expect(dispatcher.calls).toEqual([]);
        expect(result.findings[0]).toMatchObject({ kind: 'unevaluableCondition', detail: expect.stringContaining('SCENE-GUARD-001') });
    });
    for (const tags of [null, undefined]) {
        it(`should run otherwise for the null or missing field ${tags}`, async () => {
            const { dispatcher, result } = await run(tags, true);
            expect(dispatcher.calls).toEqual(['executeCommand:Fallback:{}']);
            expect(result.findings).toEqual([]);
        });
    }
    it('should run the matching string alternative', async () => {
        const { dispatcher } = await run('approved', true);
        expect(dispatcher.calls).toEqual(['executeCommand:Selected:{}']);
    });
    it('should retain array membership without guard options', async () => {
        const { dispatcher } = await run(['approved']);
        expect(dispatcher.calls).toEqual(['executeCommand:Selected:{}']);
    });
});
