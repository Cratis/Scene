// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

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
    kind: 'unknownAction' | 'unresolvedMessage';
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
 * - An action kind the engine does not know is **reported and skipped**, never silently ignored - which is what
 *   lets a newer document be opened by an older renderer without pretending it worked.
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
        if (await runOne(action, dispatcher, context, run)) return;
    }
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
            const outcome = await dispatcher.executeCommand((action as ExecuteCommandAction).command, args);
            await runSequence(outcome.isSuccess ? (action.onSuccess ?? []) : (action.onFailure ?? []), dispatcher, context, run);
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

        case InteractionActionKind.Confirm: {
            run.ran.push(describe(action));
            const confirmed = await dispatcher.confirm(messageOf((action as ConfirmAction).message, context, run.findings));
            if (!confirmed) {
                await runSequence((action.onFailure ?? []), dispatcher, context, run);
                run.stop = InteractionStop.Declined;
                return true;
            }

            await runSequence((action.onSuccess ?? []), dispatcher, context, run);
            return false;
        }

        case InteractionActionKind.RaiseTrigger: {
            run.ran.push(describe(action));
            await dispatcher.raise((action as RaiseTriggerAction).trigger, args);
            await runSequence((action.onSuccess ?? []), dispatcher, context, run);
            return false;
        }

        default:
            run.findings.push({ kind: 'unknownAction', detail: `The renderer does not know the action kind '${String(action.kind)}'` });
            run.stop = InteractionStop.Reported;
            return false;
    }
}
