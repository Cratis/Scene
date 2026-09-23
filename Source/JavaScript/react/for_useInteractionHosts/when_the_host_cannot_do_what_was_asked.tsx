// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMemo } from 'react';
import { InteractionActionKind, InteractionTriggerKind, Behavior } from '@cratis/scene.model';
import { InteractionScope, createBrowserDispatcher, useInteractionHosts, useInteractions } from '../interactions';

const navigateSomewhere: Behavior = {
    name: 'GoToInvoice',
    bindings: [
        {
            trigger: { kind: InteractionTriggerKind.Click } as never,
            actions: [{ kind: InteractionActionKind.Navigate, screen: 'InvoiceDetails' } as never],
        },
    ],
};

function Button() {
    const handlers = useInteractions('element', [navigateSomewhere]);
    return <button type="button" {...handlers}>Open</button>;
}

/**
 * A host that can do nothing at all - a preview surface, or an application half-way through being wired.
 */
function Application() {
    const { host, surfaces } = useInteractionHosts();
    const dispatcher = useMemo(() => createBrowserDispatcher(host), [host]);

    return (
        <InteractionScope dispatcher={dispatcher} attachments={[]}>
            <Button />
            {surfaces}
        </InteractionScope>
    );
}

describe('when the host cannot do what was asked', () => {
    it('should say so on the screen rather than do nothing', async () => {
        render(<Application />);

        await userEvent.click(screen.getByRole('button', { name: 'Open' }));

        screen.getByText('navigate to InvoiceDetails').textContent!.should.equal('navigate to InvoiceDetails');
    });

    // A trigger that repeats would otherwise grow the report until it covered the application it is
    // describing, which turns a useful warning into something to be closed without reading.
    it('should report the same action once however often it is asked for', async () => {
        render(<Application />);

        await userEvent.click(screen.getByRole('button', { name: 'Open' }));
        await userEvent.click(screen.getByRole('button', { name: 'Open' }));
        await userEvent.click(screen.getByRole('button', { name: 'Open' }));

        screen.getAllByText('navigate to InvoiceDetails').should.have.lengthOf(1);
    });

    it('should say nothing when nothing has failed', () => {
        render(<Application />);

        (screen.queryByText(/cannot do what the document asked/) === null).should.equal(true);
    });
});
