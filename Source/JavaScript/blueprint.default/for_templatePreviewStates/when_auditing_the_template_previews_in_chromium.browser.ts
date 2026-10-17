// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FoundationPage, landmarkRules, openFoundationPage, viewports } from '../for_foundation/given/a_foundation_page';
import { TemplatePreviewState, galleryScreenTemplates } from '../gallery';

// Every screen template the blueprint ships - the business templates a consuming application assembles screens from, the foundation, state, support, auth and
// status templates and the nesting chain - in every data state, in a real Chromium: the colour-contrast and landmark checks jsdom cannot make
// (`for_templateAccessibility` audits the same previews there for everything else). Cratis/Scene#95. Run with `yarn test:browser`.
const templates = galleryScreenTemplates.map(template => template.name);

describe('when auditing the template previews in Chromium', () => {
    let chromium: FoundationPage;

    beforeAll(async () => { chromium = await openFoundationPage(); });
    afterAll(async () => { await chromium.browser.close(); });

    for (const [viewport, size] of Object.entries(viewports)) {
        for (const theme of ['light', 'dark'] as const) {
            for (const template of templates) {
                for (const state of Object.values(TemplatePreviewState)) {
                    it(`should leave the ${template} template without violations, contrast and landmarks included, when ${state} on a ${viewport} in the ${theme} theme`, async () => {
                        await chromium.page.setViewportSize(size);
                        (await chromium.auditPreview(template, state, theme)).should.deep.equal([]);
                        chromium.errors.should.deep.equal([]);
                    });
                }
            }
        }
    }

    // A clean audit proves nothing unless the audit can fail: break the page it just judged and expect each kind of finding.
    it('should report low contrast, a second main landmark, content outside any landmark and a target smaller than 24 pixels when the page has them, so a clean audit is not vacuous', async () => {
        await chromium.page.setViewportSize(viewports.desktop);
        (await chromium.auditPreview('Dashboard', TemplatePreviewState.Populated, 'light')).should.deep.equal([]);
        const found = await chromium.page.evaluate(async rules => {
            document.body.insertAdjacentHTML('beforeend', '<p id="contrast-probe" style="color:#c8c8c8;background:#ffffff">Pale on white</p><main id="second-main">Second</main><button style="width:10px;height:10px;padding:0">x</button><button style="width:10px;height:10px;padding:0">y</button>');
            const axe_ = (window as unknown as { axe: { run(context: unknown, options: unknown): Promise<{ violations: { id: string }[] }> } }).axe;
            const wcag = await axe_.run(document.body, { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag22aa'] } });
            const landmarks = await axe_.run(document.body, { runOnly: { type: 'rule', values: rules } });
            return [...wcag.violations, ...landmarks.violations].map(violation => violation.id);
        }, landmarkRules);
        found.should.include.members(['color-contrast', 'landmark-no-duplicate-main', 'region', 'target-size']);
    });
});
