// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useRef, useState } from 'react';
import { ActionDispatcher, resolveBindingExpression, resolveSubjectReference, selectGuardedAction } from '@cratis/scene.engine';
import { BindingExpression, GuardedActionProperties, SubjectReference } from '@cratis/scene.model';
import { RegisteredComponentProps, useRenderBindingScope } from '../renderer';
import { useInteractionScope } from '../interactions/InteractionScope';

function selection(properties: GuardedActionProperties, item: unknown) {
    const alternatives = Array.isArray(properties.alternatives) ? properties.alternatives : [];
    const selected = selectGuardedAction(alternatives, item, properties.otherwise);
    const branch = selected.kind === 'alternative' ? alternatives[selected.index] : properties.otherwise;
    const unsupported = !Array.isArray(properties.alternatives) || selected.kind === 'unevaluable';
    const hidden = selected.kind === 'noSubject' || selected.kind === 'hidden';
    const key = selected.kind === 'alternative' ? `alternative:${selected.index}` : selected.kind;
    return { branch, hidden, unsupported, key };
}

interface CommandSelection {
    command?: string;
    arguments?: Record<string, SubjectReference>;
    item: unknown;
    properties: GuardedActionProperties;
    dispatcher?: ActionDispatcher;
    element: RegisteredComponentProps['element'];
    verify: () => boolean;
}

function useGuardedCommand(selected: CommandSelection) {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const inFlight = useRef(false);
    const [, refresh] = useState(0);
    const invoke = async () => {
        if (inFlight.current) return;
        if (!selected.command) return;
        if (!selected.verify()) { refresh(value => value + 1); return; }
        inFlight.current = true;
        setPending(true);
        setError('');
        try {
            await execute(selected);
        } catch (failure) {
            setError(failure instanceof Error ? failure.message : 'The guarded action failed.');
        } finally {
            inFlight.current = false;
            setPending(false);
        }
    };
    return { pending, error, invoke };
}

async function execute(selected: CommandSelection): Promise<void> {
    if (!selected.command) return;
    const args = resolveArguments(selected.arguments, selected.item);
    if (!selected.dispatcher) {
        raiseCommand(selected, args);
        return;
    }
    const outcome = await selected.dispatcher.executeCommand(selected.command, { item: selected.item, ...args });
    if (!outcome.isSuccess) throw new Error('The command did not succeed.');
    await navigateAfterSuccess(selected.properties, selected.item, selected.dispatcher);
}

export function CoreGuardedAction({ element }: RegisteredComponentProps) {
    const properties = element.properties as unknown as GuardedActionProperties;
    const scope = useRenderBindingScope();
    const interaction = useInteractionScope();
    const rawItem = Object.hasOwn(properties, 'item') ? properties.item : scope.dataContext;
    const item = resolveItem(rawItem, binding => resolveBindingExpression(binding, scope));
    const { branch, hidden, unsupported, key } = selection(properties, item);
    const command = unsupported ? undefined : branch?.command;
    const verify = () => {
        const current = selection(properties, item);
        return current.key === key && current.branch?.command === command;
    };
    const state = useGuardedCommand({ command, arguments: branch?.arguments, item, properties, dispatcher: interaction?.dispatcher, element, verify });
    if (hidden) return null;
    const disabled = actionDisabled(state.pending, command);
    return <span data-scene-id={element.id}>
        <button type='button' className='scene-action scene-toolbar-button' disabled={disabled} data-scene-command={command} title={diagnosticTitle(unsupported)} aria-busy={state.pending} onClick={() => void state.invoke()}>
            {actionLabel(properties.label)}
        </button>
        <ActionStatus unsupported={unsupported} error={state.error} />
    </span>;
}

function actionLabel(label: string): string {
    return label || 'Action';
}

function actionDisabled(pending: boolean, command: string | undefined): boolean {
    return pending || !command;
}

function diagnosticTitle(unsupported: boolean): string | undefined {
    return unsupported ? 'SCENE-GUARD-001: This action\'s guard could not be resolved.' : undefined;
}

function resolveItem(value: unknown, resolve: (binding: BindingExpression) => unknown): unknown {
    if (value === null || typeof value !== 'object') return value;
    return typeof (value as BindingExpression).path === 'string' ? resolve(value as BindingExpression) : value;
}

function ActionStatus({ unsupported, error }: { unsupported: boolean; error: string }) {
    if (unsupported) return <span role='alert'>SCENE-GUARD-001: This action's guard could not be resolved.</span>;
    return error ? <span role='alert'>{error}</span> : null;
}

function resolveArguments(bindings: Record<string, SubjectReference> = {}, item: unknown): Record<string, unknown> {
    return Object.fromEntries(Object.entries(bindings).map(([name, reference]) => {
        const value = resolveSubjectReference(reference, item);
        if (value === undefined || value === null) throw new Error(`The argument '${name}' could not be resolved.`);
        return [name, value];
    }));
}

function raiseCommand(selected: CommandSelection, args: Record<string, unknown>): void {
    const { command, element, item, properties } = selected;
    window.dispatchEvent(new CustomEvent('cratis.scene.command', { detail: { command, element, arguments: args, item, navigateToScreen: properties.navigateToScreen, navigateByParameter: properties.navigateByParameter } }));
}

async function navigateAfterSuccess(properties: GuardedActionProperties, item: unknown, dispatcher: ActionDispatcher): Promise<void> {
    if (!properties.navigateToScreen) return;
    await dispatcher.navigate(properties.navigateToScreen, navigationParameters(properties.navigateByParameter, item));
}

function navigationParameters(parameter: string | undefined, item: unknown): Record<string, unknown> {
    const navigation: Record<string, unknown> = {};
    if (parameter) {
        const value = resolveSubjectReference({ subject: `item.${parameter}` }, item);
        if (value === undefined || value === null) throw new Error('The navigation parameter could not be resolved.');
        navigation[parameter] = value;
    }
    return navigation;
}
