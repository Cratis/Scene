// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingMode, BindingSourceKind, ExecuteCommandAction, InteractionAction, InteractionActionKind, BindingNullBehavior, PropertyValueType, SetStateAction } from '@cratis/scene.model';
import { InteractionContext, InteractionStop, runActions } from '../runActions';
import { ResponseContract, ResponseValidationContracts, ResponseValueType } from '../ResponseValidationContracts';
import { validateResponseBindings } from '../validateResponseBindings';
import { commandResponseContext } from '../commandResponseContext';
import { RecordingDispatcher } from './given/a_recording_dispatcher';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '..', '..', '..', '..', 'command-response-fixtures.json'), 'utf8')) as {
    cases: { name: string; response?: ResponseContract; path: string; target?: ResponseValueType; expectedValueType?: PropertyValueType; mode?: BindingMode; valid: boolean }[];
    scopes: { name: string; actions: InteractionAction[]; diagnostics: number }[];
    runtime: { name: string; type: ResponseValueType; value?: unknown; path: string; target: ResponseValueType; valid: boolean; expected?: unknown }[];
};

const binding = { kind: BindingSourceKind.CommandResponse, path: '' };
const state: SetStateAction = { kind: InteractionActionKind.SetState, target: 'id', value: binding };
const contracts: ResponseValidationContracts = { commandResponse: () => ({ kind: 'value', type: { kind: 'string' } }), targetType: () => ({ kind: 'string' }) };
const context: InteractionContext = { resolve: () => undefined, responseContracts: contracts };
const execute = (command: string, onSuccess: SetStateAction[] = []): ExecuteCommandAction => ({ kind: InteractionActionKind.ExecuteCommand, command, onSuccess });

class ResponseDispatcher extends RecordingDispatcher {
    override async executeCommand(command: string) {
        this.calls.push(`execute:${command}`);
        return { isSuccess: command !== 'failed', response: command === 'missing' ? undefined : command };
    }
}

describe('when consuming command responses', () => {
    for (const entry of corpus.cases) {
        it(`should validate ${entry.name} identically to C#`, () => {
            const target = entry.target as ResponseValueType | undefined;
            const action = { ...state, value: { ...binding, path: entry.path, mode: ('mode' in entry ? entry.mode : undefined) as BindingMode | undefined, expectedValueType: ('expectedValueType' in entry ? entry.expectedValueType : undefined) as PropertyValueType | undefined } };
            const supplied: ResponseValidationContracts = { commandResponse: () => entry.response as ResponseContract | undefined, targetType: () => target };
            (validateResponseBindings({ kind: 'form', command: 'create', onSubmit: [action] }, supplied).length === 0).should.equal(entry.valid);
        });
    }

    for (const entry of corpus.scopes) {
        it(`should validate lexical scope ${entry.name} identically to C#`, () => {
            const supplied: ResponseValidationContracts = { commandResponse: command => command === 'known' ? { kind: 'value', type: { kind: 'string' } } : undefined, targetType: () => ({ kind: 'string' }) };
            validateResponseBindings({ kind: 'actions', actions: entry.actions }, supplied).should.have.lengthOf(entry.diagnostics);
        });
    }

    for (const entry of corpus.runtime) {
        it(`should resolve ${entry.name} before dispatch and ignore nullBehavior for missing data`, async () => {
            const dispatcher = new RecordingDispatcher();
            const values: unknown[] = [];
            dispatcher.setState = (_, value) => { values.push(value); };
            const supplied: InteractionContext = { resolve: () => undefined, responseContracts: { commandResponse: () => ({ kind: 'value', type: entry.type }), targetType: () => entry.target } };
            const action: SetStateAction = { ...state, value: { ...binding, path: entry.path, nullBehavior: BindingNullBehavior.Clear } };
            const result = await runActions([action], dispatcher, commandResponseContext(supplied, 'create', entry.value));
            result.stop.should.equal(entry.valid ? InteractionStop.Completed : InteractionStop.Reported);
            values.should.deep.equal(entry.valid ? [entry.expected] : []);
        });
    }

    it('should refuse inherited runtime members', async () => {
        const dispatcher = new RecordingDispatcher();
        const supplied: InteractionContext = { resolve: () => undefined, responseContracts: { commandResponse: () => ({ kind: 'value', type: { kind: 'object', properties: { id: { kind: 'string' } } } }), targetType: () => ({ kind: 'string' }) } };
        const response: unknown = Object.create({ id: 'inherited' });
        const action: SetStateAction = { ...state, value: { ...binding, path: 'id' } };
        const result = await runActions([action], dispatcher, commandResponseContext(supplied, 'create', response));
        result.stop.should.equal(InteractionStop.Reported);
        dispatcher.calls.should.have.lengthOf(0);
    });

    for (const kind of [InteractionActionKind.Navigate, InteractionActionKind.OpenDialog, InteractionActionKind.Notify, InteractionActionKind.Confirm]) {
        it(`should validate response-bearing ${kind} operands before dispatch`, async () => {
            const dispatcher = new ResponseDispatcher();
            const action = { kind, screen: 'detail', dialogTemplate: 'detail', arguments: [{ name: 'id', value: binding }], message: { binding } } as InteractionAction;
            const result = await runActions([action], dispatcher, context);
            result.stop.should.equal(InteractionStop.Reported);
            dispatcher.calls.should.have.lengthOf(0);
        });
    }

    for (const kind of [InteractionActionKind.NavigateBack, InteractionActionKind.Confirm]) {
        it(`should propagate a nested ${kind} stop through the enclosing command`, async () => {
            const dispatcher = new ResponseDispatcher();
            dispatcher.confirmAnswer = false;
            const result = await runActions([{ ...execute('outer'), onSuccess: [{ kind, message: { text: 'Proceed?' } } as InteractionAction] }, execute('must-not-run')], dispatcher, context);
            result.stop.should.equal(kind === InteractionActionKind.NavigateBack ? InteractionStop.Navigated : InteractionStop.Declined);
            dispatcher.calls.some(call => call.includes('must-not-run')).should.equal(false);
        });
    }

    it('should replace metadata for a nested differently shaped response and restore its parent', async () => {
        const dispatcher = new RecordingDispatcher();
        dispatcher.executeCommand = async command => ({ isSuccess: true, response: command === 'inner' ? { id: 'inner-id' } : 'outer-id' });
        const supplied: InteractionContext = { ...context, responseContracts: { ...contracts, commandResponse: command => ({ kind: 'value', type: command === 'inner' ? { kind: 'object', properties: { id: { kind: 'string' } } } : { kind: 'string' } }) } };
        await runActions([{ ...execute('outer'), onSuccess: [execute('inner', [{ ...state, value: { ...binding, path: 'id' } }]), state] }], dispatcher, supplied);
        dispatcher.calls.should.deep.equal(['setState:id:inner-id', 'setState:id:outer-id']);
    });

    it('should allow response-independent success actions without metadata or payload', async () => {
        const dispatcher = new RecordingDispatcher();
        const result = await runActions([{ ...execute('void'), onSuccess: [{ kind: InteractionActionKind.NavigateBack }] }], dispatcher, { resolve: () => undefined });
        result.stop.should.equal(InteractionStop.Navigated);
    });

    it('should restore outer success after nested success and not leak to later siblings', async () => {
        const dispatcher = new ResponseDispatcher();
        const result = await runActions([{ ...execute('outer'), onSuccess: [state, execute('inner', [state]), state] }, state], dispatcher, context);
        dispatcher.calls.should.deep.equal(['execute:outer', 'setState:id:outer', 'execute:inner', 'setState:id:inner', 'setState:id:outer']);
        result.stop.should.equal(InteractionStop.Reported);
    });

    it('should stop on an unavailable response before effects or later siblings', async () => {
        const dispatcher = new ResponseDispatcher();
        const result = await runActions([execute('missing', [state]), execute('later')], dispatcher, context);
        dispatcher.calls.should.deep.equal(['execute:missing']);
        result.stop.should.equal(InteractionStop.Reported);
    });

    it('should clear response scope in command failure continuations', async () => {
        const dispatcher = new ResponseDispatcher();
        const result = await runActions([{ ...execute('outer'), onSuccess: [{ ...execute('failed'), onFailure: [state] }] }], dispatcher, context);
        dispatcher.calls.should.deep.equal(['execute:outer', 'execute:failed']);
        result.stop.should.equal(InteractionStop.Reported);
    });

    it('should reject response reads in root and failure branches during validation', () => {
        validateResponseBindings({ kind: 'actions', actions: [state, { ...execute('outer'), onFailure: [state] }] }, contracts).should.have.lengthOf(2);
    });

    it('should keep concurrent runs independent', async () => {
        const first = new ResponseDispatcher();
        const second = new ResponseDispatcher();
        await Promise.all([runActions([execute('first', [state])], first, context), runActions([execute('second', [state])], second, context)]);
        first.calls.should.deep.equal(['execute:first', 'setState:id:first']);
        second.calls.should.deep.equal(['execute:second', 'setState:id:second']);
    });
});
