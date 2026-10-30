// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Behavior, ExecuteCommandAction, GuardOperator, InteractionActionKind, InteractionTriggerKind } from '@cratis/scene.model';
import { RecordingDispatcher } from '../../engine/for_runActions/given/a_recording_dispatcher';
import { InteractionScope, useInteractions } from '../interactions';
import { RenderBindingScopeProvider } from '../renderer/RenderBindingScopeContext';

const behavior: Behavior = { bindings: [{
    trigger: { kind: InteractionTriggerKind.Click }, actions: [],
    alternatives: [{
        condition: { kind: 'comparison', left: { subject: 'item.tags' }, operator: GuardOperator.Contains, right: 'approved' },
        actions: [{ kind: InteractionActionKind.ExecuteCommand, command: 'Selected' } as ExecuteCommandAction],
    }],
    otherwise: [{ kind: InteractionActionKind.ExecuteCommand, command: 'Fallback' } as ExecuteCommandAction],
}] };
const clicks = [behavior];
const intervals: Behavior[] = [{ bindings: [{ ...behavior.bindings![0], trigger: { seconds: 1 } }] }];

function Button({ behaviors }: { behaviors: Behavior[] }) {
    return <button {...useInteractions('test', behaviors)}>Run</button>;
}

function draw(tags: unknown, nested = false, behaviors = clicks) {
    const dispatcher = new RecordingDispatcher();
    const onFindings = vi.fn();
    const button = <RenderBindingScopeProvider dataContext={{ tags }}><Button behaviors={behaviors} /></RenderBindingScopeProvider>;
    render(<InteractionScope dispatcher={dispatcher} attachments={[]} onFindings={onFindings}
        context={{ resolve: () => undefined, subject: () => ({ tags }), guards: { strictOperands: true } }}>
        {nested ? <InteractionScope dispatcher={dispatcher} attachments={[]}>{button}</InteractionScope> : button}
    </InteractionScope>);
    return { dispatcher, onFindings };
}

describe('when enforcing string-only contains in interactions', () => {
    afterEach(() => vi.useRealTimers());
    for (const nested of [false, true]) {
        it(`should refuse array operands and report findings with nested scope ${nested}`, async () => {
            const { dispatcher, onFindings } = draw(['approved'], nested);
            fireEvent.click(screen.getByRole('button'));
            await waitFor(() => expect(onFindings).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({ kind: 'unevaluableCondition', detail: expect.stringContaining('SCENE-GUARD-001') }),
            ])));
            expect(dispatcher.calls).toEqual([]);
        });
    }
    for (const tags of [null, undefined]) {
        it(`should run otherwise for the null or missing field ${tags}`, async () => {
            const { dispatcher, onFindings } = draw(tags);
            fireEvent.click(screen.getByRole('button'));
            await waitFor(() => expect(dispatcher.calls).toEqual(['executeCommand:Fallback:{}']));
            expect(onFindings).not.toHaveBeenCalled();
        });
    }
    it('should run the matching string alternative', async () => {
        const { dispatcher } = draw('approved');
        fireEvent.click(screen.getByRole('button'));
        await waitFor(() => expect(dispatcher.calls).toEqual(['executeCommand:Selected:{}']));
    });
    it('should refuse array operands and report interval findings', async () => {
        vi.useFakeTimers();
        const { dispatcher, onFindings } = draw(['approved'], false, intervals);
        await act(() => vi.advanceTimersByTimeAsync(1000));
        expect(dispatcher.calls).toEqual([]);
        expect(onFindings).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({ kind: 'unevaluableCondition', detail: expect.stringContaining('SCENE-GUARD-001') }),
        ]));
    });
});
