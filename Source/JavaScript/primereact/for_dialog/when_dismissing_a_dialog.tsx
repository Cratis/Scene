// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createPortal } from 'react-dom';
import { PrimeReactProvider } from '@primereact/core';
import { PrimeDialog } from '../overlay/PrimeDialog';
import { PrimeCalendar } from '../form/PrimeCalendar';
import { sceneComponent } from '../storyElements';

function renderDialog(properties: Record<string, unknown> = {}) {
    render(<PrimeReactProvider><PrimeDialog element={sceneComponent('edit', 'dialog', { visible: true, header: 'Edit order', ...properties })} slots={{ content: [
        <input key='name' aria-label='Name' defaultValue='Saved draft' />,
        createPortal(<button type='button'>Portaled option</button>, document.body),
    ] }} /></PrimeReactProvider>);
}

const backdrop = () => document.querySelector<HTMLElement>('[data-scope="dialog"][data-part="backdrop"]')!;
const positioner = () => document.querySelector<HTMLElement>('[data-scope="dialog"][data-part="positioner"]')!;
const pointerClick = (target: HTMLElement) => { fireEvent.pointerDown(target); fireEvent.pointerUp(target); };
const shouldBeClosed = () => waitFor(() => (screen.queryByRole('dialog', { name: 'Edit order' }) === null).should.equal(true));
const shouldBeOpen = () => {
    const dialog = screen.getByRole('dialog', { name: 'Edit order' });
    dialog.hasAttribute('data-open').should.equal(true);
    return dialog;
};

describe('when dismissing a dialog', () => {
    beforeEach(() => vi.stubGlobal('ResizeObserver', class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
    }));
    afterEach(() => vi.unstubAllGlobals());

    it('should dismiss on the backdrop by default', async () => {
        renderDialog();
        pointerClick(backdrop());
        await shouldBeClosed();
    });

    it('should dismiss on the empty positioner by default', async () => {
        renderDialog();
        pointerClick(positioner());
        await shouldBeClosed();
    });

    it('should allow outside dismissal when explicitly enabled', async () => {
        renderDialog({ dismissable: true });
        pointerClick(backdrop());
        await shouldBeClosed();
    });

    it('should retain the dialog and its input when outside dismissal is disabled', () => {
        renderDialog({ dismissable: false });
        fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Unsaved draft' } });
        pointerClick(backdrop());
        pointerClick(positioner());
        shouldBeOpen();
        (screen.getByRole('textbox', { name: 'Name' }) as HTMLInputElement).value.should.equal('Unsaved draft');
    });

    it('should keep ordinary dialog interactions inside', () => {
        renderDialog();
        pointerClick(screen.getByRole('textbox', { name: 'Name' }));
        shouldBeOpen();
    });

    it('should keep interactions inside a portaled popover inside the dialog', () => {
        renderDialog();
        const option = screen.getByRole('button', { name: 'Portaled option' });
        shouldBeOpen().contains(option).should.equal(false);
        pointerClick(option);
        shouldBeOpen();
    });

    it('should not dismiss when a pointer press on the backdrop ends inside a portaled popover', () => {
        renderDialog();
        fireEvent.pointerDown(backdrop());
        fireEvent.pointerUp(screen.getByRole('button', { name: 'Portaled option' }));
        shouldBeOpen();
    });

    it('should not dismiss when a pointer press on the positioner ends inside a portaled popover', () => {
        renderDialog();
        fireEvent.pointerDown(positioner());
        fireEvent.pointerUp(screen.getByRole('button', { name: 'Portaled option' }));
        shouldBeOpen();
    });

    it('should not dismiss when a pointer press inside the dialog ends outside', () => {
        renderDialog();
        fireEvent.pointerDown(screen.getByRole('textbox', { name: 'Name' }));
        fireEvent.pointerUp(positioner());
        shouldBeOpen();
    });

    it('should not dismiss after a cancelled outside pointer press', () => {
        renderDialog();
        fireEvent.pointerDown(positioner());
        fireEvent.pointerCancel(positioner());
        fireEvent.pointerUp(positioner());
        shouldBeOpen();
    });

    it('should keep the explicit close button available when outside dismissal is disabled', async () => {
        renderDialog({ dismissable: false });
        fireEvent.click(screen.getByRole('button', { name: 'Close' }));
        await shouldBeClosed();
    });

    it('should keep Escape dismissal available when outside dismissal is disabled', async () => {
        renderDialog({ dismissable: false });
        fireEvent.keyDown(document, { key: 'Escape' });
        await shouldBeClosed();
    });

    it('should keep a real portaled calendar selection from closing the dialog', async () => {
        render(<PrimeReactProvider><PrimeDialog element={sceneComponent('edit', 'dialog', { visible: true, header: 'Edit order' })} slots={{ content: [
            <PrimeCalendar key='date' element={sceneComponent('due', 'calendar', { ariaLabel: 'Due date', value: '2026-10-15', showIcon: false })} slots={{}} />,
        ] }} /></PrimeReactProvider>);
        fireEvent.click(screen.getByRole('combobox', { name: 'Due date' }));
        const day = await screen.findByText('16');
        shouldBeOpen().contains(day).should.equal(false);
        fireEvent.pointerDown(positioner());
        fireEvent.pointerUp(day);
        shouldBeOpen();
        pointerClick(day);
        fireEvent.click(day);
        shouldBeOpen();
        (screen.getByRole('combobox', { name: 'Due date' }) as HTMLInputElement).value.should.contain('16');
    });
});
