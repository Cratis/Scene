// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionDispatcher, CommandOutcome, InteractionContext } from '@cratis/scene.engine';
import { Behavior, InteractionActionKind, InteractionTriggerKind, NotificationLevel } from '@cratis/scene.model';
import { InteractionScope, useInteractions } from '../interactions';

const calls: string[] = [];

const dispatcher = {
    async executeCommand(command: string, args: Record<string, unknown>): Promise<CommandOutcome> {
        calls.push(`executeCommand:${command}:${JSON.stringify(args)}`);
        return { isSuccess: true };
    },
    navigate: (screenName: string) => { calls.push(`navigate:${screenName}`); },
    navigateBack: () => { calls.push('navigateBack'); },
    openDialog: async () => { calls.push('openDialog'); return { isConfirmed: true }; },
    closeDialog: () => { calls.push('closeDialog'); },
    refreshQuery: async (query: string) => { calls.push(`refreshQuery:${query}`); },
    setState: (target: string) => { calls.push(`setState:${target}`); },
    notify: (level: NotificationLevel, message: string) => { calls.push(`notify:${level}:${message}`); },
    confirm: async () => { calls.push('confirm'); return true; },
    raise: async (trigger: string) => { calls.push(`raise:${trigger}`); },
} satisfies ActionDispatcher;

const context: InteractionContext = { resolve: binding => `<${binding.path}>` };

const cancelOnClick: Behavior = {
    name: 'CancelInvoice',
    bindings: [
        {
            trigger: { kind: InteractionTriggerKind.Click } as never,
            actions: [
                {
                    kind: InteractionActionKind.ExecuteCommand,
                    command: 'CancelInvoice',
                    arguments: [{ name: 'invoiceId', value: { path: 'item.invoiceId' } }],
                    onSuccess: [{ kind: InteractionActionKind.RefreshQuery, query: 'Invoices' }],
                } as never,
            ],
        },
    ],
};

function Button({ behaviors }: { behaviors?: Behavior[] }) {
    const handlers = useInteractions('element', behaviors);
    return <button type="button" {...handlers}>Cancel</button>;
}

function renderInScope(behaviors?: Behavior[]) {
    return render(
        <InteractionScope dispatcher={dispatcher} context={context} attachments={[]}>
            <Button behaviors={behaviors} />
        </InteractionScope>
    );
}

describe('when clicking an element that executes a command', () => {
    beforeEach(() => { calls.length = 0; });

    // The whole point of everything beneath this: a document said what a click does, and a click does it.
    it('should execute the command the document declared', async () => {
        renderInScope([cancelOnClick]);

        await userEvent.click(screen.getByRole('button'));

        calls.should.eql(['executeCommand:CancelInvoice:{"invoiceId":"<item.invoiceId>"}', 'refreshQuery:Invoices']);
    });

    it('should not make an element interactive when nothing is attached', async () => {
        renderInScope();

        await userEvent.click(screen.getByRole('button'));
        calls.should.have.lengthOf(0);
    });

    // A handler attached for a trigger the document never mentioned would swallow the event from whatever
    // encloses the element, which is a bug you find by accident and spend an afternoon on.
    it('should attach no handler for a trigger the document does not use', async () => {
        renderInScope([cancelOnClick]);

        await userEvent.dblClick(screen.getByRole('button'));

        // The two clicks a double click is made of still run the click binding - that is what a double click
        // is. What must not happen is a double-click handler existing when no binding asked for one.
        calls.filter(call => call.startsWith('executeCommand')).should.have.lengthOf(2);
    });

    it('should run a behavior attached further out as well as its own', async () => {
        render(
            <InteractionScope
                dispatcher={dispatcher}
                context={context}
                attachments={[{
                    level: 'module',
                    behaviors: [{
                        name: 'ModuleWide',
                        bindings: [{
                            trigger: { kind: InteractionTriggerKind.Click } as never,
                            actions: [{ kind: InteractionActionKind.Notify, level: NotificationLevel.Info, message: { text: 'from the module' } } as never],
                        }],
                    }],
                }]}>
                <Button behaviors={[cancelOnClick]} />
            </InteractionScope>
        );

        await userEvent.click(screen.getByRole('button'));

        calls.should.eql([
            'notify:Info:from the module',
            'executeCommand:CancelInvoice:{"invoiceId":"<item.invoiceId>"}',
            'refreshQuery:Invoices',
        ]);
    });

    it('should not run a binding whose guard is false', async () => {
        render(
            <InteractionScope
                dispatcher={dispatcher}
                // The guard has to actually resolve to false; a context echoing the path would make every
                // guard a non-empty string, and so always true.
                context={{ resolve: () => false }}
                attachments={[]}>
                <Button behaviors={[{
            name: 'Guarded',
            bindings: [{
                trigger: { kind: InteractionTriggerKind.Click } as never,
                condition: { path: 'item.canCancel' },
                actions: [{ kind: InteractionActionKind.ExecuteCommand, command: 'CancelInvoice' } as never],
            }],
                }]} />
            </InteractionScope>
        );

        await userEvent.click(screen.getByRole('button'));
        calls.should.have.lengthOf(0);
    });
});
