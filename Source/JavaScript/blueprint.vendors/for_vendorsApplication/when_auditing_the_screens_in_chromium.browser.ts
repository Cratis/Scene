// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { vendorsDialogTemplates, vendorsScreenDefinitions } from '../index';
import { VendorsPage, openVendorsPage, viewports } from './given/a_vendors_page';
import { tracker, packs } from './given';

// Spec Part B 6: "verified at desktop, tablet and phone widths in light and dark themes". These are the real screens in the real shell, filled from each sample-data
// pack, audited with axe-core including colour contrast, with no page overflow. Run with `yarn test:browser`.
describe('when auditing the Vendors screens in Chromium', () => {
    let chromium: VendorsPage;

    beforeAll(async () => { chromium = await openVendorsPage(); });
    afterAll(async () => { await chromium.browser.close(); });

    for (const [viewport, size] of Object.entries(viewports)) {
        for (const theme of ['light', 'dark'] as const) {
            for (const screen of vendorsScreenDefinitions) {
                const pack = tracker;
                it(`should leave ${screen.name} with the ${pack.id} data without violations, contrast included, and without overflow on a ${viewport} in the ${theme} theme`, async () => {
                    await chromium.page.setViewportSize(size);
                    (await chromium.auditScreen(screen.name, pack, packs, theme)).should.deep.equal([]);
                    chromium.errors.should.deep.equal([]);
                });
            }

            for (const dialog of vendorsDialogTemplates) {
                it(`should leave ${dialog.name} over its list without violations and inside the window on a ${viewport} in the ${theme} theme`, async () => {
                    await chromium.page.setViewportSize(size);
                    const screen = { VendorsQuickCreateVendor: 'vendors.list' }[dialog.name]!;
                    (await chromium.auditDialog(screen, dialog.name, tracker, packs, theme)).should.deep.equal([]);
                    chromium.errors.should.deep.equal([]);
                });
            }
        }
    }

        it('should keep every record reachable on a phone: nothing hidden, nothing cut', async () => {
        await chromium.page.setViewportSize(viewports.phone);
        await chromium.auditScreen('vendors.list', tracker, packs, 'light');
        (await chromium.page.locator('.foundation-card-row').count()).should.equal(10);
    });

    it('should keep the board usable on a phone: every column reachable', async () => {
        await chromium.page.setViewportSize(viewports.phone);
        await chromium.auditScreen('vendors.onboarding', tracker, packs, 'light');
        (await chromium.page.locator('.foundation-board-column').count()).should.equal(4);
    });
});
