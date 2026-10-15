// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FoundationPage, openFoundationPage, viewports } from '../for_foundation/given/a_foundation_page';
import { foundationOnlyDialogNames as dialogNames, foundationPack, stateScreenNames } from './given';

// Spec Part B 6 for the dialogs and the auth and state screens: "verified at desktop, tablet and phone widths in light and dark themes", in a real browser with
// colour contrast, and a dialog that stays inside the window and fills it on a phone. Run with `yarn test:browser`.
describe('when auditing the dialogs and state screens in Chromium', () => {
    let chromium: FoundationPage;

    beforeAll(async () => { chromium = await openFoundationPage(); });
    afterAll(async () => { await chromium.browser.close(); });

    for (const [viewport, size] of Object.entries(viewports)) {
        for (const theme of ['light', 'dark'] as const) {
            for (const name of dialogNames) {
                it(`should leave the dialog ${name} without violations, contrast included, and inside the window on a ${viewport} in the ${theme} theme`, async () => {
                    await chromium.page.setViewportSize(size);
                    (await chromium.auditDialog(name, foundationPack, theme)).should.deep.equal([]);
                    chromium.errors.should.deep.equal([]);
                });
            }

            for (const name of stateScreenNames) {
                it(`should leave ${name} without violations, contrast included, and without overflow on a ${viewport} in the ${theme} theme`, async () => {
                    await chromium.page.setViewportSize(size);
                    const problems = await chromium.auditScreen(name, foundationPack, theme);
                    problems.should.deep.equal([]);
                    chromium.errors.should.deep.equal([]);
                });
            }
        }
    }

    const boxOf = async () => chromium.page.locator('.foundation-dialog-host > .scene-template').boundingBox();

    it('should draw a dialog centered on a desktop and over the scrim of the whole window', async () => {
        await chromium.page.setViewportSize(viewports.desktop);
        await chromium.auditDialog('QuickCreateDialog', foundationPack, 'light');
        const box = (await boxOf())!;
        Math.abs(box.x + box.width / 2 - viewports.desktop.width / 2).should.be.lessThan(2);
        box.width.should.be.lessThan(viewports.desktop.width / 2);
    });

    it('should draw the side sheet against the inline end of the window and the full height', async () => {
        await chromium.page.setViewportSize(viewports.desktop);
        await chromium.auditDialog('SideSheet', foundationPack, 'light');
        const box = (await boxOf())!;
        [Math.round(box.x + box.width), Math.round(box.height)].should.deep.equal([viewports.desktop.width, viewports.desktop.height]);
    });

    it('should fill the page with every dialog on a phone', async () => {
        await chromium.page.setViewportSize(viewports.phone);
        for (const name of dialogNames) {
            await chromium.auditDialog(name, foundationPack, 'light');
            const box = (await boxOf())!;
            [name, Math.round(box.width), Math.round(box.height)].should.deep.equal([name, viewports.phone.width, viewports.phone.height]);
        }
    });

    it('should keep the footer actions in view while the body of a dialog scrolls', async () => {
        await chromium.page.setViewportSize(viewports.phone);
        await chromium.auditDialog('SideSheet', foundationPack, 'light');
        const actions = (await chromium.page.locator('[data-slot="actions"]').boundingBox())!;
        Math.round(actions.y + actions.height).should.equal(viewports.phone.height);
    });
});
