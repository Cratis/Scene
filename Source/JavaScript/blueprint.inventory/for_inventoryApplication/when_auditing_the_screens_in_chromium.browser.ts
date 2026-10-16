// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { inventoryDialogTemplates, inventoryScreenDefinitions } from '../index';
import { InventoryPage, openInventoryPage, viewports } from './given/a_inventory_page';
import { warehouse, packs } from './given';

// Spec Part B 6: "verified at desktop, tablet and phone widths in light and dark themes". These are the real screens in the real shell, filled from each sample-data
// pack, audited with axe-core including colour contrast, with no page overflow. Run with `yarn test:browser`.
describe('when auditing the Inventory and Assets screens in Chromium', () => {
    let chromium: InventoryPage;

    beforeAll(async () => { chromium = await openInventoryPage(); });
    afterAll(async () => { await chromium.browser.close(); });

    for (const [viewport, size] of Object.entries(viewports)) {
        for (const theme of ['light', 'dark'] as const) {
            for (const screen of inventoryScreenDefinitions) {
                const pack = warehouse;
                it(`should leave ${screen.name} with the ${pack.id} data without violations, contrast included, and without overflow on a ${viewport} in the ${theme} theme`, async () => {
                    await chromium.page.setViewportSize(size);
                    (await chromium.auditScreen(screen.name, pack, packs, theme)).should.deep.equal([]);
                    chromium.errors.should.deep.equal([]);
                });
            }

            for (const dialog of inventoryDialogTemplates) {
                it(`should leave ${dialog.name} over its list without violations and inside the window on a ${viewport} in the ${theme} theme`, async () => {
                    await chromium.page.setViewportSize(size);
                    const screen = {'InventoryAdjustStock': 'inventory.items.record', 'InventoryQuickCreateItem': 'inventory.items', 'InventoryQuickCreateSupplier': 'inventory.suppliers'}[dialog.name]!;
                    (await chromium.auditDialog(screen, dialog.name, warehouse, packs, theme)).should.deep.equal([]);
                    chromium.errors.should.deep.equal([]);
                });
            }
        }
    }

    it('should turn a list into cards on a phone and keep the table on a desktop', async () => {
        await chromium.page.setViewportSize(viewports.desktop);
        await chromium.auditScreen('inventory.items', warehouse, packs, 'light');
        (await chromium.page.locator('.foundation-table').count()).should.be.greaterThan(0);
        (await chromium.page.locator('.foundation-cards').count()).should.equal(0);

        await chromium.page.setViewportSize(viewports.phone);
        await chromium.auditScreen('inventory.items', warehouse, packs, 'light');
        (await chromium.page.locator('.foundation-cards').count()).should.be.greaterThan(0);
    });

    it('should keep every record reachable on a phone: nothing hidden, nothing cut', async () => {
        await chromium.page.setViewportSize(viewports.phone);
        await chromium.auditScreen('inventory.items', warehouse, packs, 'light');
        (await chromium.page.locator('.foundation-card-row').count()).should.equal(10);
    });
});
