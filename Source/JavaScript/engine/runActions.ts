// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionBinding } from '@cratis/scene.model';
import { ResolvedBinding } from './resolveBehaviors';
import {
    ConfirmAction,
    ExecuteCommandAction,
    InteractionAction,
    InteractionActionKind,
    InteractionArgument,
    InteractionMessage,
    NavigateAction,
    NotifyAction,
    OpenDialogAction,
    RaiseTriggerAction,
    RefreshQueryAction,
    SetStateAction,
} from '@cratis/scene.model';

import { ActionDispatcher } from './ActionDispatcher';
import { BindingResolver } from './BindingResolver';
import { GuardEvaluationOptions, selectGuardedInteraction } from './guards';
import { ResponseContract, ResponseValidationContracts } from './ResponseValidationContracts';
import { validateResponseAction } from './validateResponseBindings';
import { commandResponseContext, ResponseBindingUnavailable } from './commandResponseContext';

/**
 * Why an interaction stopped before running everything it was given.
 */
export enum InteractionStop {
    /** Everything ran. */
    Completed = 'Completed',

    /** A `confirm` was declined, so the actions it gates did not run. */
    Declined = 'Declined',

    /** A navigation happened, so anything after it belonged to a screen that is gone. */
    Navigated = 'Navigated',

    /** An action could not be realized and was reported. */
    Reported = 'Reported',
}

/**
 * Something an interaction could not do.
 *
 * Findings are collected rather than thrown: one unresolvable action must not take down the rest of the
 * application, and 'this application produced no findings' has to be checkable rather than a matter of opinion.
 */
export interface InteractionFinding {
    kind: 'unknownAction' | 'unresolvedMessage' | 'unresolvedCondition' | 'unevaluableCondition' | 'invalidResponseBinding';
    detail: string;
}

/**
 * What an interaction did.
 */
export interface InteractionRun {
    stop: InteractionStop;
    findings: InteractionFinding[];
    /** The actions that actually ran, in order - the thing a spec asserts on. */
    ran: string[];
}

/**
 * How to resolve the values an action needs.
 */
export interface InteractionContext {
    resolve: BindingResolver;
    /** Opt-in guard evaluation rules. Screenplay hosts set { strictOperands: true }. */
    guards?: GuardEvaluationOptions;
    responseContracts?: ResponseValidationContracts;
    responseContract?: ResponseContract;
    subject?: () => unknown;
    /** Looks up a localization key. Returns the key itself when the host has no catalogue for it. */
    localize?: (key: string) => string;
}

function describe(action: InteractionAction): string {
    switch (action.kind) {
        case InteractionActionKind.ExecuteCommand: return `execute ${(action as ExecuteCommandAction).command}`;
        case InteractionActionKind.Navigate: return `navigate to ${(action as NavigateAction).screen}`;
        case InteractionActionKind.NavigateBack: return 'navigate back';
        case InteractionActionKind.OpenDialog: return `open dialog ${(action as OpenDialogAction).dialogTemplate}`;
        case InteractionActionKind.CloseDialog: return 'close dialog';
        case InteractionActionKind.RefreshQuery: return `refresh ${(action as RefreshQueryAction).query}`;
        case InteractionActionKind.SetState: return `set ${(action as SetStateAction).target}`;
        case InteractionActionKind.Notify: return 'notify';
        case InteractionActionKind.Confirm: return 'confirm';
        case InteractionActionKind.RaiseTrigger: return `raise ${(action as RaiseTriggerAction).trigger}`;
        default: return String(action.kind);
    }
}

function argumentsOf(action: InteractionAction, context: InteractionContext): Record<string, unknown> {
    const args: Record<string, unknown> = {};
    for (const argument of (action.arguments ?? []) as InteractionArgument[]) {
        args[argument.name] = context.resolve(argument.value);
    }

    return args;
}

function messageOf(message: InteractionMessage, context: InteractionContext, findings: InteractionFinding[]): string {
    if (message.text !== undefined) return message.text;
    if (message.stringsKey !== undefined) return context.localize ? context.localize(message.stringsKey) : message.stringsKey;
    if (message.binding !== undefined) {
        const resolved = context.resolve(message.binding);
        if (resolved === undefined || resolved === null) {
            findings.push({ kind: 'unresolvedMessage', detail: `The message binding '${message.binding.path}' resolved to nothing` });
            return '';
        }

        return String(resolved);
    }

    findings.push({ kind: 'unresolvedMessage', detail: 'The action carries no message' });
    return '';
}

/**
 * Runs a sequence of actions, in order, handling continuations.
 *
 * The rules, all of which live here rather than in a renderer so they can be asserted without a DOM:
 *
 * - Actions run in the order they were declared.
 * - A declined `confirm` stops the sequence. Gating what follows is the whole point of it.
 * - A navigation stops the sequence, because the screen the remaining actions were written for is gone. The
 *   compiler reports that as unreachable, so reaching it at runtime means the document changed underneath.
 * - An action that can fail branches into `onSuccess` or `onFailure`; a dialog also runs `onResult`.
 * - An action kind the engine does not know is **reported and the sequence abandoned**, never silently skipped.
 *   Continuing would half-apply a sequence whose gate may well have been the action this renderer could not
 *   understand. This is what lets a newer document be opened by an older renderer without pretending it worked.
 *
 * @param actions The actions to run.
 * @param dispatcher The seam that performs the effects.
 * @param context How to resolve bindings and localization.
 * @returns What happened.
 */
export async function runActions(
    actions: InteractionAction[],
    dispatcher: ActionDispatcher,
    context: InteractionContext
): Promise<InteractionRun> {
    const run: InteractionRun = { stop: InteractionStop.Completed, findings: [], ran: [] };
    await runSequence(actions, dispatcher, context, run);
    return run;
}

async function runSequence(
    actions: InteractionAction[],
    dispatcher: ActionDispatcher,
    context: InteractionContext,
    run: InteractionRun
): Promise<void> {
    for (const action of actions) {
        if (run.stop !== InteractionStop.Completed) return;
        const diagnostics = validateResponseAction(action, context.responseContract, context.responseContracts);
        if (diagnostics.length) {
            run.findings.push(...diagnostics.map(diagnostic => ({ kind: 'invalidResponseBinding' as const, detail: diagnostic.message })));
            run.stop = InteractionStop.Reported;
            return;
        }
        try {
            if (await runOne(action, dispatcher, context, run)) return;
        } catch (error) {
            if (!(error instanceof ResponseBindingUnavailable)) throw error;
            run.findings.push({ kind: 'invalidResponseBinding', detail: error.message });
            run.stop = InteractionStop.Reported;
            return;
        }
    }
}

async function runConfirmation(action: ConfirmAction, dispatcher: ActionDispatcher, context: InteractionContext, run: InteractionRun) {
    run.ran.push(describe(action));
    const confirmed = await dispatcher.confirm(messageOf(action.message, context, run.findings));
    if (!confirmed) {
        await runSequence(action.onFailure ?? [], dispatcher, context, run);
        if (run.stop === InteractionStop.Completed) run.stop = InteractionStop.Declined;
        return true;
    }
    await runSequence(action.onSuccess ?? [], dispatcher, context, run);
    return false;
}

async function runOne(
    action: InteractionAction,
    dispatcher: ActionDispatcher,
    context: InteractionContext,
    run: InteractionRun
): Promise<boolean> {
    const args = argumentsOf(action, context);

    switch (action.kind) {
        case InteractionActionKind.ExecuteCommand: {
            run.ran.push(describe(action));
            const command = (action as ExecuteCommandAction).command;
            const outcome = await dispatcher.executeCommand(command, args);
            const continuation = commandResponseContext(context, command, outcome.response, outcome.isSuccess);
            await runSequence(outcome.isSuccess ? (action.onSuccess ?? []) : (action.onFailure ?? []), dispatcher, continuation, run);
            return false;
        }

        case InteractionActionKind.Navigate:
            run.ran.push(describe(action));
            await dispatcher.navigate((action as NavigateAction).screen, args);
            run.stop = InteractionStop.Navigated;
            return true;

        case InteractionActionKind.NavigateBack:
            run.ran.push(describe(action));
            await dispatcher.navigateBack();
            run.stop = InteractionStop.Navigated;
            return true;

        case InteractionActionKind.OpenDialog: {
            run.ran.push(describe(action));
            const outcome = await dispatcher.openDialog((action as OpenDialogAction).dialogTemplate, args);
            await runSequence(outcome.isConfirmed ? (action.onSuccess ?? []) : (action.onFailure ?? []), dispatcher, context, run);
            await runSequence((action.onResult ?? []), dispatcher, context, run);
            return false;
        }

        case InteractionActionKind.CloseDialog:
            run.ran.push(describe(action));
            await dispatcher.closeDialog();
            return false;

        case InteractionActionKind.RefreshQuery: {
            run.ran.push(describe(action));
            await dispatcher.refreshQuery((action as RefreshQueryAction).query);
            await runSequence((action.onSuccess ?? []), dispatcher, context, run);
            return false;
        }

        case InteractionActionKind.SetState:
            run.ran.push(describe(action));
            dispatcher.setState((action as SetStateAction).target, context.resolve((action as SetStateAction).value));
            return false;

        case InteractionActionKind.Notify:
            run.ran.push(describe(action));
            dispatcher.notify((action as NotifyAction).level, messageOf((action as NotifyAction).message, context, run.findings));
            return false;

        case InteractionActionKind.Confirm:
            return runConfirmation(action as ConfirmAction, dispatcher, context, run);

        case InteractionActionKind.RaiseTrigger: {
            run.ran.push(describe(action));
            await dispatcher.raise((action as RaiseTriggerAction).trigger, args);
            await runSequence((action.onSuccess ?? []), dispatcher, context, run);
            return false;
        }

        default:
            run.findings.push({ kind: 'unknownAction', detail: `The renderer does not know the action kind '${String(action.kind)}'` });
            run.stop = InteractionStop.Reported;
            return true;
    }
}

/**
 * Runs the bindings a trigger resolved to, in order, honouring each one's guard.
 *
 * The `where` guard belongs here rather than in a renderer for the same reason the sequencing does: whether a
 * binding applies is a property of the document, not of the event that arrived. A guard that resolves to
 * nothing is treated as false and reported - an interaction that silently does nothing is indistinguishable
 * from one that is broken, and the whole point of a finding is to tell those apart.
 *
 * @param bindings The bindings to run, already resolved and ordered.
 * @param dispatcher The seam that performs the effects.
 * @param context How to resolve bindings and localization.
 * @returns What happened across all of them.
 */
export async function runBindings(
    bindings: ResolvedBinding[],
    dispatcher: ActionDispatcher,
    context: InteractionContext
): Promise<InteractionRun> {
    const run: InteractionRun = { stop: InteractionStop.Completed, findings: [], ran: [] };

    for (const candidate of bindings) {
        if (!applies(candidate.binding, context, run)) continue;

        const actions = branchActions(candidate.binding, context, run);
        if (!actions) continue;
        await runSequence(actions, dispatcher, context, run);

        // A navigation or a declined confirm ends the interaction, not merely the binding that caused it.
        // The screen the later bindings were attached to is gone, or the gate they sat behind was refused.
        if (run.stop !== InteractionStop.Completed) break;
    }

    return run;
}

function branchActions(binding: InteractionBinding, context: InteractionContext, run: InteractionRun): InteractionAction[] | undefined {
    if (binding.alternatives === undefined) return binding.actions ?? [];
    if ((binding.actions?.length ?? 0) > 0) {
        run.findings.push({ kind: 'unevaluableCondition', detail: 'SCENE-GUARD-001: An interaction cannot combine actions and alternatives' });
        return undefined;
    }
    const selected = selectGuardedInteraction(binding.alternatives, context.subject?.() ?? context.resolve({ path: 'item' }), binding.otherwise !== undefined, context.guards);
    if (selected.kind === 'alternative') return binding.alternatives[selected.index].actions;
    if (selected.kind === 'otherwise') return binding.otherwise;
    if (selected.kind === 'unevaluable') run.findings.push({ kind: 'unevaluableCondition', detail: 'SCENE-GUARD-001: The structured guard could not be resolved' });
    return undefined;
}

function applies(binding: InteractionBinding, context: InteractionContext, run: InteractionRun): boolean {
    if (!binding.condition) return true;

    const value = context.resolve(binding.condition);
    if (value === undefined || value === null) {
        run.findings.push({
            kind: 'unresolvedCondition',
            detail: `The guard '${binding.condition.path}' resolved to nothing, so the binding did not run`,
        });
        return false;
    }

    return Boolean(value);
}
