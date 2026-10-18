// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { invoicingDialogTemplates, invoicingScreenDefinitions } from '../index';
import { InvoicingPage, openInvoicingPage, viewports } from './given/a_invoicing_page';
import { tracker, packs } from './given';

// Spec Part B 6: "verified at desktop, tablet and phone widths in light and dark themes". These are the real screens in the real shell, filled from each sample-data
// pack, audited with axe-core including colour contrast, with no page overflow. Run with `yarn test:browser`.
describe('when auditing the Invoicing screens in Chromium', () => {
    let chromium: InvoicingPage;

    beforeAll(async () => { chromium = await openInvoicingPage(); });
    afterAll(async () => { await chromium.browser.close(); });

    for (const [viewport, size] of Object.entries(viewports)) {
        for (const theme of ['light', 'dark'] as const) {
            for (const screen of invoicingScreenDefinitions) {
                const pack = tracker;
                it(`should leave ${screen.name} with the ${pack.id} data without violations, contrast included, and without overflow on a ${viewport} in the ${theme} theme`, async () => {
                    await chromium.page.setViewportSize(size);
                    (await chromium.auditScreen(screen.name, pack, packs, theme)).should.deep.equal([]);
                    chromium.errors.should.deep.equal([]);
                });
            }

            for (const dialog of invoicingDialogTemplates) {
                it(`should leave ${dialog.name} over its list without violations and inside the window on a ${viewport} in the ${theme} theme`, async () => {
                    await chromium.page.setViewportSize(size);
                    const screen = { InvoicingQuickCreateInvoice: 'invoicing.list', InvoicingRecordPayment: 'invoicing.record' }[dialog.name]!;
                    (await chromium.auditDialog(screen, dialog.name, tracker, packs, theme)).should.deep.equal([]);
                    chromium.errors.should.deep.equal([]);
                });
            }
        }
    }

        it('should keep every record reachable on a phone: nothing hidden, nothing cut', async () => {
        await chromium.page.setViewportSize(viewports.phone);
        await chromium.auditScreen('invoicing.list', tracker, packs, 'light');
        (await chromium.page.locator('.foundation-card-row').count()).should.equal(10);
    });
});
