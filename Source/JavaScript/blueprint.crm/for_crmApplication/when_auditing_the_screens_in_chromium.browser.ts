// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { crmDialogTemplates, crmScreenDefinitions } from '../index';
import { CrmPage, openCrmPage, viewports } from './given/a_crm_page';
import { enterprise, nordic, packs } from './given';

// Spec Part B 6: "verified at desktop, tablet and phone widths in light and dark themes". These are the real screens in the real shell, filled from each sample-data
// pack, audited with axe-core including colour contrast, with no page overflow. Run with `yarn test:browser`.
describe('when auditing the CRM screens in Chromium', () => {
    let chromium: CrmPage;

    beforeAll(async () => { chromium = await openCrmPage(); });
    afterAll(async () => { await chromium.browser.close(); });

    for (const [viewport, size] of Object.entries(viewports)) {
        for (const theme of ['light', 'dark'] as const) {
            for (const screen of crmScreenDefinitions) {
                const pack = screen.order === undefined || screen.order % 2 === 0 ? enterprise : nordic;
                it(`should leave ${screen.name} with the ${pack.id} data without violations, contrast included, and without overflow on a ${viewport} in the ${theme} theme`, async () => {
                    await chromium.page.setViewportSize(size);
                    (await chromium.auditScreen(screen.name, pack, packs, theme)).should.deep.equal([]);
                    chromium.errors.should.deep.equal([]);
                });
            }

            for (const dialog of crmDialogTemplates) {
                it(`should leave ${dialog.name} over its list without violations and inside the window on a ${viewport} in the ${theme} theme`, async () => {
                    await chromium.page.setViewportSize(size);
                    const screen = dialog.name.endsWith('Lead') ? 'crm.leads' : dialog.name.endsWith('Contact') ? 'crm.contacts' : dialog.name.endsWith('Company') ? 'crm.companies' : dialog.name.endsWith('Deal') ? 'crm.deals.list' : 'crm.activities';
                    (await chromium.auditDialog(screen, dialog.name, enterprise, packs, theme)).should.deep.equal([]);
                    chromium.errors.should.deep.equal([]);
                });
            }
        }
    }

    it('should turn a list into cards on a phone and keep the table on a desktop', async () => {
        await chromium.page.setViewportSize(viewports.desktop);
        await chromium.auditScreen('crm.leads', enterprise, packs, 'light');
        (await chromium.page.locator('.foundation-table').count()).should.be.greaterThan(0);
        (await chromium.page.locator('.foundation-cards').count()).should.equal(0);

        await chromium.page.setViewportSize(viewports.phone);
        await chromium.auditScreen('crm.leads', enterprise, packs, 'light');
        (await chromium.page.locator('.foundation-cards').count()).should.be.greaterThan(0);
    });

    it('should keep every lead reachable on a phone: nothing hidden, nothing cut', async () => {
        await chromium.page.setViewportSize(viewports.phone);
        await chromium.auditScreen('crm.leads', enterprise, packs, 'light');
        (await chromium.page.locator('.foundation-card-row').count()).should.equal(10);
    });
});
