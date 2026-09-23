// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression, NotificationLevel } from '@cratis/scene.model';
import { ActionDispatcher, CommandOutcome, DialogOutcome } from '../../ActionDispatcher';
import { InteractionContext } from '../../runActions';

/**
 * A dispatcher that records what it was asked to do instead of doing it.
 *
 * The whole point of the engine owning the sequencing is that this is possible: no DOM, no React, no transport -
 * the rules are assertable as a list of calls.
 */
export class RecordingDispatcher implements ActionDispatcher {
    readonly calls: string[] = [];

    commandSucceeds = true;
    dialogConfirmed = true;
    confirmAnswer = true;

    async executeCommand(command: string, args: Record<string, unknown>): Promise<CommandOutcome> {
        this.calls.push(`executeCommand:${command}:${JSON.stringify(args)}`);
        return this.commandSucceeds
            ? { isSuccess: true }
            : { isSuccess: false, validationErrors: [{ member: 'amount', message: 'Must be positive' }] };
    }

    navigate(screen: string): void {
        this.calls.push(`navigate:${screen}`);
    }

    navigateBack(): void {
        this.calls.push('navigateBack');
    }

    async openDialog(dialogTemplate: string, args: Record<string, unknown>): Promise<DialogOutcome> {
        this.calls.push(`openDialog:${dialogTemplate}:${JSON.stringify(args)}`);
        return { isConfirmed: this.dialogConfirmed, result: 'the-result' };
    }

    closeDialog(): void {
        this.calls.push('closeDialog');
    }

    async refreshQuery(query: string): Promise<void> {
        this.calls.push(`refreshQuery:${query}`);
    }

    setState(target: string, value: unknown): void {
        this.calls.push(`setState:${target}:${String(value)}`);
    }

    notify(level: NotificationLevel, message: string): void {
        this.calls.push(`notify:${level}:${message}`);
    }

    async confirm(message: string): Promise<boolean> {
        this.calls.push(`confirm:${message}`);
        return this.confirmAnswer;
    }

    async raise(trigger: string): Promise<void> {
        this.calls.push(`raise:${trigger}`);
    }
}

/**
 * A context that resolves a binding to its path, so an assertion can see which binding was used.
 */
export const pathEchoingContext: InteractionContext = {
    resolve: (binding: BindingExpression) => `<${binding.path}>`,
};
