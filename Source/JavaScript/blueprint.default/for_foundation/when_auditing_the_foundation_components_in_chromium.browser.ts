// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { foundationComponentMetadata } from '../foundation/foundationComponentMetadata';
import { FoundationPage, openFoundationPage, viewports } from './given/a_foundation_page';

// Spec Part B 6: "verified at desktop, tablet and phone widths in light and dark themes". Run with `yarn test:browser`: colour
// contrast, reflow and overflow need real layout, which jsdom does not have, so the jsdom audit cannot assert them.
const foundationNames = Object.keys(foundationComponentMetadata);

describe('when auditing the foundation components in Chromium', () => {
    let chromium: FoundationPage;

    beforeAll(async () => { chromium = await openFoundationPage(); });
    afterAll(async () => { await chromium.browser.close(); });

    for (const [viewport, size] of Object.entries(viewports)) {
        for (const theme of ['light', 'dark'] as const) {
            for (const name of foundationNames) {
                it(`should leave ${name} in every state without violations, contrast included, on a ${viewport} in the ${theme} theme`, async () => {
                    await chromium.page.setViewportSize(size);
                    (await chromium.audit(name, theme)).should.deep.equal([]);
                    chromium.errors.should.deep.equal([]);
                });
            }
        }
    }

    for (const name of foundationNames) {
        it(`should leave ${name} without violations with every disclosure open, in both themes on a phone`, async () => {
            await chromium.page.setViewportSize(viewports.phone);
            for (const theme of ['light', 'dark'] as const) (await chromium.audit(name, theme, undefined, false, true)).should.deep.equal([]);
        });
    }

    it('should leave a right-to-left page without violations or overflow on a phone', async () => {
        await chromium.page.setViewportSize(viewports.phone);
        (await chromium.audit('statCard', 'light', { label: 'خط الأنابيب', locale: 'ar-EG' }, true)).should.deep.equal([]);
    });
});
