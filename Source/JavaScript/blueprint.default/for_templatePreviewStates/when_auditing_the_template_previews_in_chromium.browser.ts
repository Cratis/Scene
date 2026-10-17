// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

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
            const marker = document.createElement('div');
            marker.innerHTML = '<p style="color:#c8c8c8;background:#ffffff">Pale on white</p><main>Second</main><button style="width:10px;height:10px;padding:0">x</button><button style="width:10px;height:10px;padding:0">y</button>';
            document.body.append(marker);
            const axe_ = (window as unknown as { axe: { run(context: unknown, options: unknown): Promise<{ violations: { id: string }[] }> } }).axe;
            const wcag = await axe_.run(document.body, { runOnly: { type: 'tag', values: ['wcag2aa', 'wcag22aa'] } });
            const landmarks = await axe_.run(document.body, { runOnly: { type: 'rule', values: rules } });
            marker.remove();
            return [...wcag.violations, ...landmarks.violations].map(violation => violation.id);
        }, landmarkRules);
        found.should.include.members(['color-contrast', 'landmark-no-duplicate-main', 'region', 'target-size']);
    });

    // Found by the vector on the live Stage and a generated React application (Cratis/Scene#95), where PrimeReact is styled and its tables are wide: a grid item keeps
    // min-width: auto, so a widget holding a wide table pushed its track past the window. This page draws a template's content without the template's arrangement, so the
    // rule is asserted on an item of the arrangement's slot, and the vector asserts what it does to a real page.
    it('should let every item of a template slot shrink to its track, so a wide widget scrolls inside itself instead of widening the page', async () => {
        await chromium.page.setViewportSize(viewports.phone);
        await chromium.auditPreview('Dashboard', TemplatePreviewState.Populated, 'light');
        const minimumWidth = await chromium.page.evaluate(() => {
            const slot = document.createElement('section');
            slot.className = 'scene-template-slot';
            slot.innerHTML = '<section id="slot-item">item</section>';
            document.body.append(slot);
            const value = getComputedStyle(slot.querySelector('#slot-item')!).minWidth;
            slot.remove();
            return value;
        });
        minimumWidth.should.equal('0px');
    });

    it('should give every tag severity the contrast WCAG AA asks for with white text in the light scheme, whatever PrimeReact preset paints it', async () => {
        await chromium.page.setViewportSize(viewports.desktop);
        await chromium.auditPreview('MasterDetail', TemplatePreviewState.Populated, 'light');
        const found = await chromium.page.evaluate(async () => {
            const host = document.querySelector('.layout-wrapper')!;
            host.insertAdjacentHTML('beforeend', ['info', 'success', 'warn', 'danger'].map(severity => `<span class="tag-probe" style="background:var(--p-tag-${severity}-background);color:#ffffff;padding:4px;font-size:12px;font-weight:700">${severity}</span>`).join(''));
            const axe_ = (window as unknown as { axe: { run(context: unknown, options: unknown): Promise<{ violations: { nodes: { target: string[] }[] }[] }> } }).axe;
            const result = await axe_.run('.layout-wrapper', { runOnly: { type: 'rule', values: ['color-contrast'] } });
            return result.violations.flatMap(violation => violation.nodes.map(node => node.target.join(' '))).filter(target => target.includes('tag-probe'));
        });
        found.should.deep.equal([]);
    });

    it('should not use light-dark() in the shell stylesheet, which a host pipeline lowers into custom properties that stay unset (a tag with no background in the Stage)', () => {
        const css = readFileSync(fileURLToPath(new URL('../shell/layout.css', import.meta.url)), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
        css.includes('light-dark(').should.be.false;
    });

    it('should keep Lara\'s own tag colours in the dark scheme', async () => {
        await chromium.page.setViewportSize(viewports.desktop);
        await chromium.auditPreview('MasterDetail', TemplatePreviewState.Populated, 'dark');
        const warn = await chromium.page.evaluate(() => {
            const wrapper = document.querySelector('.layout-wrapper')!;
            const scheme = wrapper.closest('[data-scene-color-scheme]') ?? wrapper;
            scheme.setAttribute('data-scene-color-scheme', 'dark');
            return getComputedStyle(wrapper).getPropertyValue('--p-tag-warn-background').trim();
        });
        warn.should.equal('#fb923c');
    });

    it('should draw the scheme it is asked for every time, so the dark audit is not the light page again', async () => {
        const seen: string[] = [];
        for (const theme of ['light', 'dark', 'light', 'dark'] as const) {
            await chromium.auditPreview('MasterDetail', TemplatePreviewState.Populated, theme);
            seen.push(await chromium.page.evaluate(() => document.querySelector('.layout-wrapper')!.closest('[data-scene-color-scheme]')?.getAttribute('data-scene-color-scheme') ?? 'none'));
        }
        seen.should.deep.equal(['light', 'dark', 'light', 'dark']);
    });
});
