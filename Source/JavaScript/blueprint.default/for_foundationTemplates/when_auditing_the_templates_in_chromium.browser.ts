// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FoundationPage, openFoundationPage, viewports } from '../for_foundation/given/a_foundation_page';
import { foundationPack, foundationTemplateNames } from './given';

// Spec Part B 6: "verified at desktop, tablet and phone widths in light and dark themes". These are the real templates in the real shell, filled from the
// sample-data pack, audited with axe-core including colour contrast, with no page overflow. Run with `yarn test:browser`.
describe('when auditing the foundation templates in Chromium', () => {
    let chromium: FoundationPage;

    beforeAll(async () => { chromium = await openFoundationPage(); });
    afterAll(async () => { await chromium.browser.close(); });

    for (const [viewport, size] of Object.entries(viewports)) {
        for (const theme of ['light', 'dark'] as const) {
            for (const name of foundationTemplateNames) {
                it(`should leave ${name} without violations, contrast included, and without overflow on a ${viewport} in the ${theme} theme`, async () => {
                    await chromium.page.setViewportSize(size);
                    (await chromium.auditScreen(name, foundationPack, theme)).should.deep.equal([]);
                    chromium.errors.should.deep.equal([]);
                });
            }
        }
    }

    it('should turn the list into cards on a phone and keep the table on a desktop', async () => {
        await chromium.page.setViewportSize(viewports.desktop);
        await chromium.auditScreen('ListScreen', foundationPack, 'light');
        (await chromium.page.locator('.foundation-table').count()).should.be.greaterThan(0);
        (await chromium.page.locator('.foundation-cards').count()).should.equal(0);

        await chromium.page.setViewportSize(viewports.phone);
        await chromium.auditScreen('ListScreen', foundationPack, 'light');
        (await chromium.page.locator('.foundation-cards').count()).should.be.greaterThan(0);
    });

    it('should keep every list row reachable on a phone: nothing hidden, nothing cut', async () => {
        await chromium.page.setViewportSize(viewports.phone);
        await chromium.auditScreen('ListScreen', foundationPack, 'light');
        const cards = await chromium.page.locator('.foundation-card-row').count();
        cards.should.equal(5);
    });
});
