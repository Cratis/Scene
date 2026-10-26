// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Behavior, ExecuteCommandAction, GuardOperator, InteractionActionKind, InteractionTriggerKind } from '@cratis/scene.model';
import { RecordingDispatcher } from '../../engine/for_runActions/given/a_recording_dispatcher';
import { InteractionScope, useInteractions } from '../interactions';
import { RenderBindingScopeProvider } from '../renderer/RenderBindingScopeContext';

const behavior: Behavior = {
    bindings: [{
        trigger: { kind: InteractionTriggerKind.Click }, actions: [],
        alternatives: [{
            condition: { kind: 'comparison', left: { subject: 'item.id' }, operator: GuardOperator.Equal, right: 1 },
            actions: [{ kind: InteractionActionKind.ExecuteCommand, command: 'Selected' } as ExecuteCommandAction],
        }],
        otherwise: [{ kind: InteractionActionKind.ExecuteCommand, command: 'Fallback' } as ExecuteCommandAction],
    }],
};

const behaviors = [behavior];

function Button() {
    return <button {...useInteractions('test', behaviors)}>Run</button>;
}

describe('when selecting a guarded interaction', () => {
    it('should replace the gesture subject while behaviors and interaction scope remain stable', async () => {
        const dispatcher = new RecordingDispatcher();
        const attachments: [] = [];
        const content = (dataContext: unknown) => <InteractionScope dispatcher={dispatcher} attachments={attachments}>
            <RenderBindingScopeProvider dataContext={dataContext}><Button /></RenderBindingScopeProvider>
        </InteractionScope>;
        const view = render(content({ id: 1 }));
        fireEvent.click(screen.getByRole('button'));
        await waitFor(() => expect(dispatcher.calls).toEqual(['executeCommand:Selected:{}']));

        view.rerender(content({ id: 2 }));
        fireEvent.click(screen.getByRole('button'));
        await waitFor(() => expect(dispatcher.calls).toEqual(['executeCommand:Selected:{}', 'executeCommand:Fallback:{}']));
    });
    it('should use the current render subject for the gesture', async () => {
        const dispatcher = new RecordingDispatcher();
        render(<InteractionScope dispatcher={dispatcher} attachments={[]}>
            <RenderBindingScopeProvider dataContext={{ id: 1 }}><Button /></RenderBindingScopeProvider>
        </InteractionScope>);
        fireEvent.click(screen.getByRole('button'));
        await waitFor(() => expect(dispatcher.calls).toEqual(['executeCommand:Selected:{}']));
    });
    it('should prefer an explicit host subject callback', async () => {
        const dispatcher = new RecordingDispatcher();
        render(<InteractionScope dispatcher={dispatcher} attachments={[]} context={{ resolve: () => undefined, subject: () => ({ id: 2 }) }}>
            <RenderBindingScopeProvider dataContext={{ id: 1 }}><Button /></RenderBindingScopeProvider>
        </InteractionScope>);
        fireEvent.click(screen.getByRole('button'));
        await waitFor(() => expect(dispatcher.calls).toEqual(['executeCommand:Fallback:{}']));
    });
    it('should not execute otherwise without a subject', () => {
        const dispatcher = new RecordingDispatcher();
        render(<InteractionScope dispatcher={dispatcher} attachments={[]}><Button /></InteractionScope>);
        fireEvent.click(screen.getByRole('button'));
        expect(dispatcher.calls).toEqual([]);
    });
});
