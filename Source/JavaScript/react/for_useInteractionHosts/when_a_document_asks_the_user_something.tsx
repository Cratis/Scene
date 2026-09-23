// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMemo } from 'react';
import { InteractionActionKind, InteractionTriggerKind, Behavior, NotificationLevel } from '@cratis/scene.model';
import { InteractionScope, createBrowserDispatcher, useInteractionHosts, useInteractions } from '../interactions';

const executed: string[] = [];

const confirmThenExecute: Behavior = {
    name: 'CancelInvoice',
    bindings: [
        {
            trigger: { kind: InteractionTriggerKind.Click } as never,
            actions: [
                { kind: InteractionActionKind.Confirm, message: { text: 'Cancel this invoice?' } } as never,
                { kind: InteractionActionKind.ExecuteCommand, command: 'CancelInvoice' } as never,
                { kind: InteractionActionKind.Notify, level: NotificationLevel.Info, message: { text: 'Invoice cancelled' } } as never,
            ],
        },
    ],
};

function Button({ behaviors }: { behaviors: Behavior[] }) {
    const handlers = useInteractions('element', behaviors);
    return <button type="button" {...handlers}>Cancel</button>;
}

function Application({ behaviors }: { behaviors: Behavior[] }) {
    const { host, surfaces } = useInteractionHosts();
    const dispatcher = useMemo(() => createBrowserDispatcher({
        ...host,
        executeCommand: async command => {
            executed.push(command);
            return { isSuccess: true };
        },
    }), [host]);

    return (
        <InteractionScope dispatcher={dispatcher} attachments={[]}>
            <Button behaviors={behaviors} />
            {surfaces}
        </InteractionScope>
    );
}

describe('when a document asks the user something', () => {
    beforeEach(() => { executed.length = 0; });

    it('should ask in the page rather than in a browser prompt', async () => {
        render(<Application behaviors={[confirmThenExecute]} />);

        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        screen.getByRole('alertdialog').getAttribute('aria-label')!.should.equal('Cancel this invoice?');
    });

    // The reason a confirm exists at all: what follows it runs only if the answer was yes.
    it('should not run what follows until the question is answered', async () => {
        render(<Application behaviors={[confirmThenExecute]} />);

        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        executed.should.have.lengthOf(0);
    });

    it('should run what follows when the answer is yes', async () => {
        render(<Application behaviors={[confirmThenExecute]} />);

        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        await userEvent.click(screen.getByRole('button', { name: 'OK' }));

        executed.should.eql(['CancelInvoice']);
    });

    it('should abandon the sequence when the answer is no', async () => {
        render(<Application behaviors={[confirmThenExecute]} />);

        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        // Two buttons say 'Cancel' now - the modelled one and the declining choice - so the question has to
        // be answered through the dialog it belongs to.
        await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));

        executed.should.have.lengthOf(0);
    });

    it('should take the question down once it is answered', async () => {
        render(<Application behaviors={[confirmThenExecute]} />);

        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        await userEvent.click(screen.getByRole('button', { name: 'OK' }));

        (screen.queryByRole('alertdialog') === null).should.equal(true);
    });

    it('should show what the document said after the command ran', async () => {
        render(<Application behaviors={[confirmThenExecute]} />);

        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        await userEvent.click(screen.getByRole('button', { name: 'OK' }));

        screen.getByText('Invoice cancelled').textContent!.should.equal('Invoice cancelled');
    });
});
