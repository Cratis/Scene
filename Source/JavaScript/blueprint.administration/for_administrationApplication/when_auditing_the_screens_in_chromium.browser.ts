// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { administrationDialogTemplates, administrationScreenDefinitions } from '../index';
import { AdministrationPage, openAdministrationPage, viewports } from './given/a_administration_page';
import { admin, packs } from './given';

// Spec Part B 6: "verified at desktop, tablet and phone widths in light and dark themes". These are the real screens in the real shell, filled from each sample-data
// pack, audited with axe-core including colour contrast, with no page overflow. Run with `yarn test:browser`.
describe('when auditing the Administration screens in Chromium', () => {
    let chromium: AdministrationPage;

    beforeAll(async () => { chromium = await openAdministrationPage(); });
    afterAll(async () => { await chromium.browser.close(); });

    for (const [viewport, size] of Object.entries(viewports)) {
        for (const theme of ['light', 'dark'] as const) {
            for (const screen of administrationScreenDefinitions) {
                const pack = admin;
                it(`should leave ${screen.name} with the ${pack.id} data without violations, contrast included, and without overflow on a ${viewport} in the ${theme} theme`, async () => {
                    await chromium.page.setViewportSize(size);
                    (await chromium.auditScreen(screen.name, pack, packs, theme)).should.deep.equal([]);
                    chromium.errors.should.deep.equal([]);
                });
            }

            for (const dialog of administrationDialogTemplates) {
                it(`should leave ${dialog.name} over its list without violations and inside the window on a ${viewport} in the ${theme} theme`, async () => {
                    await chromium.page.setViewportSize(size);
                    const screen = {'AdministrationInviteUser': 'admin.users', 'AdministrationQuickCreateRole': 'admin.roles'}[dialog.name]!;
                    (await chromium.auditDialog(screen, dialog.name, admin, packs, theme)).should.deep.equal([]);
                    chromium.errors.should.deep.equal([]);
                });
            }
        }
    }

    it('should turn a list into cards on a phone and keep the table on a desktop', async () => {
        await chromium.page.setViewportSize(viewports.desktop);
        await chromium.auditScreen('admin.users', admin, packs, 'light');
        (await chromium.page.locator('.foundation-table').count()).should.be.greaterThan(0);
        (await chromium.page.locator('.foundation-cards').count()).should.equal(0);

        await chromium.page.setViewportSize(viewports.phone);
        await chromium.auditScreen('admin.users', admin, packs, 'light');
        (await chromium.page.locator('.foundation-cards').count()).should.be.greaterThan(0);
    });

    it('should keep every record reachable on a phone: nothing hidden, nothing cut', async () => {
        await chromium.page.setViewportSize(viewports.phone);
        await chromium.auditScreen('admin.users', admin, packs, 'light');
        (await chromium.page.locator('.foundation-card-row').count()).should.equal(10);
    });
});
