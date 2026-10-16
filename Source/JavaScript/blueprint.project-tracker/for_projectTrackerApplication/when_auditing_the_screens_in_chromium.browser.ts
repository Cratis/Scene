// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { projectTrackerDialogTemplates, projectTrackerScreenDefinitions } from '../index';
import { ProjectTrackerPage, openProjectTrackerPage, viewports } from './given/a_projectTracker_page';
import { tracker, packs } from './given';

// Spec Part B 6: "verified at desktop, tablet and phone widths in light and dark themes". These are the real screens in the real shell, filled from each sample-data
// pack, audited with axe-core including colour contrast, with no page overflow. Run with `yarn test:browser`.
describe('when auditing the Project and Task Tracker screens in Chromium', () => {
    let chromium: ProjectTrackerPage;

    beforeAll(async () => { chromium = await openProjectTrackerPage(); });
    afterAll(async () => { await chromium.browser.close(); });

    for (const [viewport, size] of Object.entries(viewports)) {
        for (const theme of ['light', 'dark'] as const) {
            for (const screen of projectTrackerScreenDefinitions) {
                const pack = tracker;
                it(`should leave ${screen.name} with the ${pack.id} data without violations, contrast included, and without overflow on a ${viewport} in the ${theme} theme`, async () => {
                    await chromium.page.setViewportSize(size);
                    (await chromium.auditScreen(screen.name, pack, packs, theme)).should.deep.equal([]);
                    chromium.errors.should.deep.equal([]);
                });
            }

            for (const dialog of projectTrackerDialogTemplates) {
                it(`should leave ${dialog.name} over its list without violations and inside the window on a ${viewport} in the ${theme} theme`, async () => {
                    await chromium.page.setViewportSize(size);
                    const screen = {'ProjectQuickCreateProject': 'projects.list', 'ProjectQuickCreateTask': 'projects.record', 'ProjectTaskSheet': 'projects.mytasks'}[dialog.name]!;
                    (await chromium.auditDialog(screen, dialog.name, tracker, packs, theme)).should.deep.equal([]);
                    chromium.errors.should.deep.equal([]);
                });
            }
        }
    }

    it('should show the projects as cards on a desktop and on a phone alike', async () => {
        for (const size of [viewports.desktop, viewports.phone]) {
            await chromium.page.setViewportSize(size);
            await chromium.auditScreen('projects.list', tracker, packs, 'light');
            (await chromium.page.locator('.foundation-cards').count()).should.be.greaterThan(0);
            (await chromium.page.locator('.foundation-table').count()).should.equal(0);
        }
    });

    it('should keep every project reachable on a phone: nothing hidden, nothing cut', async () => {
        await chromium.page.setViewportSize(viewports.phone);
        await chromium.auditScreen('projects.list', tracker, packs, 'light');
        (await chromium.page.locator('.foundation-card-row').count()).should.equal(8);
    });

    it('should keep the board usable on a phone: every column reachable', async () => {
        await chromium.page.setViewportSize(viewports.phone);
        await chromium.auditScreen('projects.board', tracker, packs, 'light');
        (await chromium.page.locator('.foundation-board-column').count()).should.equal(4);
    });
});
