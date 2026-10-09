// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SceneNavigationHost } from '../navigation/SceneNavigationHost';
import { createBrowserSceneHistory } from '../navigation/createBrowserSceneHistory';
import { bindingScope, destinations, dialogs, fullRegistry, screens } from './given/an_invoicing_application';

const location = () => JSON.parse(screen.getByLabelText('location').textContent!);
const address = () => `${window.location.pathname}${window.location.search}`;
const host = () => <SceneNavigationHost screens={screens} dialogs={dialogs} initialScreen='Invoices' registry={fullRegistry}
    bindingScope={bindingScope} destinations={destinations} history={createBrowserSceneHistory(window, '/app/')} />;

/** jsdom dispatches popstate asynchronously, like a browser. */
async function goBack() {
    await act(async () => {
        window.history.back();
        await new Promise(resolve => window.addEventListener('popstate', resolve, { once: true }));
    });
}

async function goForward() {
    await act(async () => {
        window.history.forward();
        await new Promise(resolve => window.addEventListener('popstate', resolve, { once: true }));
    });
}

describe('when navigating with the browser history', () => {
    beforeEach(() => window.history.replaceState(null, '', '/app/'));
    afterEach(cleanup);

    it('should write the route override and its parameters into the address bar', () => {
        render(host());
        fireEvent.click(screen.getByText('Open INV-7'));
        address().should.equal('/app/billing/invoices/INV%207?tab=lines');
        location().should.deep.include({ screen: 'InvoiceDetails', parameters: { invoiceId: 'INV 7', tab: 'lines' } });
    });

    it('should step back and forward through screens', async () => {
        render(host());
        fireEvent.click(screen.getByText('Open INV-7'));
        fireEvent.click(screen.getByText('All invoices'));
        address().should.equal('/app/billing/invoices');

        await goBack();
        address().should.equal('/app/billing/invoices/INV%207?tab=lines');
        location().screen.should.equal('InvoiceDetails');

        await goBack();
        location().screen.should.equal('Invoices');

        await goForward();
        location().should.deep.include({ screen: 'InvoiceDetails', parameters: { invoiceId: 'INV 7', tab: 'lines' } });
    });

    it('should open a deep link with its parameters', () => {
        window.history.replaceState(null, '', '/app/billing/invoices/INV-9?tab=payments');
        render(host());
        location().should.deep.include({ screen: 'InvoiceDetails', parameters: { invoiceId: 'INV-9', tab: 'payments' }, unresolved: null });
        document.querySelector('[data-scene-outlet]')!.getAttribute('data-scene-outlet')!.should.equal('content');
    });

    it('should restore the same entry on refresh', () => {
        const first = render(host());
        fireEvent.click(screen.getByText('Open INV-7'));
        fireEvent.click(screen.getByText('Void invoice'));
        first.unmount();

        render(host());
        location().should.deep.include({ screen: 'InvoiceDetails', parameters: { invoiceId: 'INV 7', tab: 'lines' } });
        Boolean(screen.getByRole('dialog', { name: 'ConfirmVoid' })).should.equal(true);
        address().should.equal('/app/billing/invoices/INV%207?tab=lines');
    });

    it('should return to the opening screen with the dialog result when the dialog closes', async () => {
        render(host());
        fireEvent.click(screen.getByText('Open INV-7'));
        fireEvent.click(screen.getByText('Void invoice'));
        Boolean(screen.getByRole('dialog', { name: 'ConfirmVoid' })).should.equal(true);

        await act(async () => {
            const popped = new Promise(resolve => window.addEventListener('popstate', resolve, { once: true }));
            fireEvent.click(screen.getByText('Void it'));
            await popped;
        });
        (screen.queryByRole('dialog') === null).should.equal(true);
        location().should.deep.include({ screen: 'InvoiceDetails', returned: { dialog: 'ConfirmVoid', result: { confirmed: true } } });
        address().should.equal('/app/billing/invoices/INV%207?tab=lines');
    });

    it('should close an open dialog with the browser back button', async () => {
        render(host());
        fireEvent.click(screen.getByText('Open INV-7'));
        fireEvent.click(screen.getByText('Void invoice'));
        await goBack();
        (screen.queryByRole('dialog') === null).should.equal(true);
        location().screen.should.equal('InvoiceDetails');
    });

    it('should fall back to the initial screen and report a deep link that matches no route', () => {
        window.history.replaceState(null, '', '/app/billing/unknown/route');
        render(host());
        location().should.deep.include({ screen: 'Invoices', unresolved: 'billing/unknown/route' });
    });
});
