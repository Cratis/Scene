// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NotificationLevel } from '@cratis/scene.model';

/**
 * What came back from executing a command.
 *
 * Validation and authorization failures are outcomes rather than exceptions, because the model already describes
 * them and a form has to show them next to the field they belong to.
 */
export interface CommandOutcome {
    isSuccess: boolean;
    validationErrors?: { member: string; message: string }[];
    exceptionMessages?: string[];
    response?: unknown;
}

/**
 * What came back from a dialog that closed.
 */
export interface DialogOutcome {
    isConfirmed: boolean;
    result?: unknown;
}

/**
 * The seam a renderer implements, one method per action kind.
 *
 * The engine decides *what* happens and in what order; the dispatcher performs the effects. That split is what
 * keeps the sequencing - continuations, short-circuits, ordering - testable without a DOM, and what lets a
 * non-React renderer inherit the semantics instead of reimplementing them.
 *
 * Every method that can fail returns an outcome rather than throwing, so a failure is something the engine can
 * branch on with `on failure` instead of something that unwinds the whole interaction.
 */
export interface ActionDispatcher {
    /**
     * Submits a command.
     */
    executeCommand(command: string, args: Record<string, unknown>): Promise<CommandOutcome>;

    /**
     * Goes to a screen. The dispatcher decides what address that is, if its platform has addresses at all.
     */
    navigate(screen: string, args: Record<string, unknown>): Promise<void> | void;

    /**
     * Goes back.
     */
    navigateBack(): Promise<void> | void;

    /**
     * Opens a dialog and resolves when it closes.
     */
    openDialog(dialogTemplate: string, args: Record<string, unknown>): Promise<DialogOutcome>;

    /**
     * Closes the innermost dialog.
     */
    closeDialog(result?: unknown): Promise<void> | void;

    /**
     * Re-runs a query.
     */
    refreshQuery(query: string): Promise<void>;

    /**
     * Writes screen state.
     */
    setState(target: string, value: unknown): void;

    /**
     * Surfaces a message.
     */
    notify(level: NotificationLevel, message: string): void;

    /**
     * Asks the user to confirm, and resolves with what they chose.
     */
    confirm(message: string): Promise<boolean>;

    /**
     * Fires an application trigger.
     */
    raise(trigger: string, args: Record<string, unknown>): Promise<void>;
}
