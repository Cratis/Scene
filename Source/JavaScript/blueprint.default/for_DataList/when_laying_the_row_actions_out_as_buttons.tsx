// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import sinon from 'sinon';
import { afterEach } from 'vitest';
import { DataList, foundationElement } from '../foundation';
import { renderFoundation, violationsIn } from '../for_foundation/given';

const columns = [{ field: 'title', header: 'Request' }, { field: 'status', header: 'Status' }];
const rows = [{ id: 'r1', title: 'Leave: Isla Morgan' }, { id: 'r2', title: 'Expense: Noah Bennett' }];

// An approver decides in one press, so a card's actions can be laid out as buttons, each naming its request, instead of a menu that hides them.
describe('when laying the row actions of a list out as buttons', () => {
    afterEach(cleanup);

    it('should keep the menu unless buttons are asked for', () => {
        const { container } = renderFoundation('dataList', { rows, columns, variant: 'cards', rowActions: ['Approve', 'Reject'] });
        container.querySelectorAll('select.foundation-row-actions').length.should.equal(2);
        container.querySelectorAll('.foundation-row-buttons').length.should.equal(0);
    });

    it('should show each action as a button that names its request', () => {
        renderFoundation('dataList', { rows, columns, variant: 'cards', rowActions: ['Approve', 'Reject', 'Request changes'], rowActionStyle: 'buttons', titleField: 'title' });
        const group = screen.getByRole('group', { name: 'Actions for Leave: Isla Morgan' });
        Array.from(group.querySelectorAll('button')).map(button => button.getAttribute('aria-label')).should.deep.equal(['Approve: Leave: Isla Morgan', 'Reject: Leave: Isla Morgan', 'Request changes: Leave: Isla Morgan']);
        within(group).getByRole('button', { name: 'Request changes: Leave: Isla Morgan' }).textContent!.should.equal('Request changes');
    });

    it('should publish the action and the row it was pressed on, as the menu does, and click once', () => {
        const published: Record<string, unknown> = {};
        const onClick = sinon.spy();
        const bindingOutputs = { setOutput: (name: string, value: unknown) => { published[name] = value; }, clearOutput: () => undefined, clearAll: () => undefined };
        render(<DataList element={foundationElement('dataList', { rows, columns, variant: 'cards', rowActions: ['Approve', 'Reject'], rowActionStyle: 'buttons', titleField: 'title' })} slots={{}} bindingOutputs={bindingOutputs} interactions={{ onClick }} />);
        fireEvent.click(within(screen.getByRole('group', { name: 'Actions for Expense: Noah Bennett' })).getByRole('button', { name: 'Reject: Expense: Noah Bennett' }));
        [published.action, onClick.callCount].should.deep.equal([{ action: 'Reject', row: 'r2' }, 1]);
    });

    it('should disable the buttons when the action permission is disabled and hide them when hidden', () => {
        const disabled = renderFoundation('dataList', { rows, columns, variant: 'cards', rowActions: ['Approve'], rowActionStyle: 'buttons', actionPermission: 'disabled' });
        Array.from(disabled.container.querySelectorAll('.foundation-row-buttons button')).every(button => (button as HTMLButtonElement).disabled).should.equal(true);
        cleanup();
        const hidden = renderFoundation('dataList', { rows, columns, variant: 'cards', rowActions: ['Approve'], rowActionStyle: 'buttons', actionPermission: 'hidden' });
        hidden.container.querySelectorAll('.foundation-row-buttons').length.should.equal(0);
    });

    it('should leave a list of buttons without an accessibility violation', async () => {
        const { container } = renderFoundation('dataList', { rows, columns, variant: 'cards', rowActions: ['Approve', 'Reject'], rowActionStyle: 'buttons', titleField: 'title' });
        (await violationsIn(container)).should.deep.equal([]);
    });
});
