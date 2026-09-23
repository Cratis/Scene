// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ActionDispatcher, CommandOutcome, DialogOutcome } from '@cratis/scene.engine';
import { NotificationLevel } from '@cratis/scene.model';

/**
 * What a host has to supply for an interaction to reach anything real.
 *
 * Every member is optional and every one that is missing is *reported* rather than quietly ignored. A host
 * that cannot execute commands is a legitimate state - a preview surface, a design tool - but a button that
 * appears to work and does nothing is not.
 */
export interface BrowserDispatcherHost {
    /** Submits a command. The transport belongs to the host: Scene does not know what a backend is. */
    executeCommand?: (command: string, args: Record<string, unknown>) => Promise<CommandOutcome>;

    /** Navigates to a screen. The URL belongs to the host, which is why no route is constructed here. */
    navigate?: (screen: string, args: Record<string, unknown>) => void;

    /** Goes back. */
    navigateBack?: () => void;

    /** Opens a dialog and answers with what the user did. */
    openDialog?: (dialogTemplate: string, args: Record<string, unknown>) => Promise<DialogOutcome>;

    /** Closes the open dialog. */
    closeDialog?: () => void;

    /** Re-runs a query. */
    refreshQuery?: (query: string) => Promise<void>;

    /** Writes screen state. */
    setState?: (target: string, value: unknown) => void;

    /** Surfaces a message. Falls back to the console rather than to nothing. */
    notify?: (level: NotificationLevel, message: string) => void;

    /** Asks the user to confirm. Falls back to the browser's own prompt. */
    confirm?: (message: string) => Promise<boolean>;

    /** Raises an application trigger. */
    raise?: (trigger: string, args: Record<string, unknown>) => Promise<void>;

    /** Where an unsupported action is reported. */
    onUnsupported?: (action: string) => void;
}

/**
 * Creates the dispatcher a browser host uses.
 *
 * This is the only place in Scene.React that knows an action has to *happen*. Everything about which actions
 * run and in what order is the engine's, which is why this file is a list of one-line delegations and holds no
 * rules of its own.
 *
 * @param host What the surrounding application can actually do.
 * @returns The {@link ActionDispatcher}.
 */
export function createBrowserDispatcher(host: BrowserDispatcherHost = {}): ActionDispatcher {
    const unsupported = (action: string) => {
        host.onUnsupported?.(action);
        console.warn(`[scene] The host cannot '${action}', so the interaction stopped there.`);
    };

    return {
        async executeCommand(command, args) {
            if (!host.executeCommand) {
                unsupported(`execute ${command}`);

                // Reported as a failure, so the document's own `on failure` runs. Answering success would
                // make a command that never reached a backend look like one that worked.
                return { isSuccess: false, validationErrors: [] };
            }

            return host.executeCommand(command, args);
        },

        navigate(screen, args) {
            if (host.navigate) {
                host.navigate(screen, args);
                return;
            }

            unsupported(`navigate to ${screen}`);
        },

        navigateBack() {
            if (host.navigateBack) {
                host.navigateBack();
                return;
            }

            unsupported('navigate back');
        },

        async openDialog(dialogTemplate, args) {
            if (!host.openDialog) {
                unsupported(`open dialog ${dialogTemplate}`);
                return { isConfirmed: false };
            }

            return host.openDialog(dialogTemplate, args);
        },

        closeDialog() {
            if (host.closeDialog) {
                host.closeDialog();
                return;
            }

            unsupported('close dialog');
        },

        async refreshQuery(query) {
            if (host.refreshQuery) {
                await host.refreshQuery(query);
                return;
            }

            unsupported(`refresh ${query}`);
        },

        setState(target, value) {
            if (host.setState) {
                host.setState(target, value);
                return;
            }

            unsupported(`set ${target}`);
        },

        notify(level, message) {
            if (host.notify) {
                host.notify(level, message);
                return;
            }

            // The console is a poor notification, but it is a real one - and a host that has not wired
            // notifications yet should still see what the document wanted to say.
            console.log(`[scene:${level}] ${message}`);
        },

        async confirm(message) {
            if (host.confirm) return host.confirm(message);

            // The browser's own prompt is the honest default: a confirm exists to gate what follows, so
            // answering `true` without asking anyone would remove the gate rather than approximate it.
            return typeof globalThis.confirm === 'function' ? globalThis.confirm(message) : false;
        },

        async raise(trigger, args) {
            if (host.raise) {
                await host.raise(trigger, args);
                return;
            }

            unsupported(`raise ${trigger}`);
        },
    };
}
