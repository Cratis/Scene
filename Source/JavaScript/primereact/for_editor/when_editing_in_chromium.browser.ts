// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Page } from 'playwright-core';
import { ChromiumPage, openChromiumPage } from '../for_primeReactPackage/given/a_chromium_page';
import { PageWindow, ShowOptions } from '../for_primeReactPackage/given/page_window';
import { forbiddenInOutput, hostileHtml } from './given/hostile_html';

const show = (page: Page, properties: Record<string, unknown>, options: ShowOptions = {}) =>
    page.evaluate(([authored, host]) => (window as unknown as PageWindow).show('editor', authored, undefined, host as ShowOptions), [properties, options] as const);

/** The globals the hostile payload sets when any part of it runs. */
const executed = (page: Page) => page.evaluate(() => Object.keys(window).filter(name => name.startsWith('__')));

describe('when editing in Chromium', () => {
    let chromium: ChromiumPage;
    let page: Page;

    beforeAll(async () => { chromium = await openChromiumPage(); page = chromium.page; });
    afterAll(async () => { await chromium.browser.close(); });
    afterEach(async () => {
        await page.evaluate(() => (window as unknown as PageWindow).hide());
        chromium.errors.should.deep.equal([]);
    });

    describe('and the editor mounts fresh', () => {
        it('should keep the Quill surface React renders around, and let the user type text and markup with the keyboard', async () => {
            await page.evaluate(() => {
                const removed: string[] = [];
                (window as unknown as { removed: string[] }).removed = removed;
                new MutationObserver(records => records.forEach(record => record.removedNodes.forEach(node => {
                    if (node instanceof HTMLElement && node.classList.contains('ql-editor')) removed.push('ql-editor');
                }))).observe(document.body, { childList: true, subtree: true });
            });
            await show(page, { value: '<p>Hello world</p>', ariaLabel: 'Notes' });
            const surface = page.locator('.ql-editor');
            await surface.waitFor();
            (await surface.getAttribute('aria-label'))!.should.equal('Notes');
            (await surface.getAttribute('role'))!.should.equal('textbox');

            for (const wait of [100, 600, 1500]) {
                await page.waitForTimeout(wait);
                (await page.locator('.ql-editor').count()).should.equal(1);
            }
            (await page.evaluate(() => (window as unknown as { removed: string[] }).removed)).should.deep.equal([]);
            (await surface.getAttribute('contenteditable'))!.should.equal('true');

            await surface.click();
            await page.keyboard.press('End');
            await page.keyboard.type(' typed');
            await page.keyboard.press('ControlOrMeta+b');
            await page.keyboard.type('bold');
            (await surface.innerHTML()).should.equal('<p>Hello world typed<strong>bold</strong></p>');
            (await page.evaluate(() => (window as unknown as PageWindow).events)).length.should.be.greaterThan(0);
        });

        it('should have the toolbar and the surface styled by the stylesheet, not browser defaults', async () => {
            await show(page, { value: '<p>Hello</p>' });
            await page.locator('.ql-editor').waitFor();
            const measured = await page.evaluate(() => {
                const icon = document.querySelector('.ql-toolbar button.ql-bold svg')!.getBoundingClientRect();
                const container = getComputedStyle(document.querySelector('.ql-container')!);
                const editor = document.querySelector('.ql-editor')!.getBoundingClientRect();
                return { iconWidth: icon.width, iconHeight: icon.height, border: container.borderBottomStyle, editorHeight: editor.height };
            });
            measured.iconWidth.should.be.within(10, 30);
            measured.iconHeight.should.be.within(10, 30);
            measured.border.should.equal('solid');
            measured.editorHeight.should.be.greaterThan(120);
        });

        it('should not report loading the document as an edit, and name every toolbar button', async () => {
            await show(page, { value: '<p>Hello</p>' });
            await page.locator('.ql-editor').waitFor();
            await page.waitForTimeout(300);
            (await page.evaluate(() => (window as unknown as PageWindow).events)).should.deep.equal([]);
            const unnamed = await page.locator('.ql-toolbar button').evaluateAll(buttons => buttons.filter(button => !(button.getAttribute('aria-label') ?? button.textContent ?? '').trim()).length);
            unnamed.should.equal(0);
        });
    });

    describe('and the value is hostile', () => {
        const states: [string, ShowOptions][] = [
            ['while Quill is still loading', { quill: 'slow' }],
            ['once Quill is loaded', { quill: 'real' }],
            ['when no Quill loader was provided', { quill: 'none' }],
            ['when Quill fails to load', { quill: 'failing' }],
        ];

        for (const [description, options] of states) {
            it(`should run nothing and leak no style, ${description}`, async () => {
                const before = await executed(page);
                await show(page, { value: hostileHtml, ariaLabel: 'Notes' }, options);
                await page.getByText('hi').first().waitFor();
                await page.waitForTimeout(options.quill === 'slow' ? 900 : 300);

                (await executed(page)).should.deep.equal(before);
                (await page.evaluate(() => getComputedStyle(document.body).outlineWidth)).should.not.equal('5px');
                const present = await page.evaluate(() => ({
                    html: (document.querySelector('.ql-editor, [data-scene-part="read-only-content"]') ?? document.body).innerHTML.toLowerCase(),
                    risky: document.querySelectorAll('#root script, #root style, #root iframe, #root svg script, #root [onerror], #root [onclick], #root img[src^="http"]').length,
                    links: Array.from(document.querySelectorAll('#root a[href]')).map(link => link.getAttribute('href')),
                }));
                present.risky.should.equal(0);
                present.links.filter(href => !/^(https?:|mailto:|tel:|about:blank$|\/|#)/.test(href!)).should.deep.equal([]);
                for (const forbidden of forbiddenInOutput) present.html.should.not.contain(forbidden.toLowerCase());
            });
        }

        it('should do nothing when its links are clicked', async () => {
            await show(page, { value: hostileHtml }, { quill: 'real' });
            await page.locator('.ql-editor').waitFor();
            for (const link of await page.locator('.ql-editor a').all()) await link.click({ trial: true }).catch(() => undefined);
            (await executed(page)).should.deep.equal([]);
        });

        it('should say why editing is unavailable when Quill fails to load, and keep the content', async () => {
            await show(page, { value: '<p>Kept</p>' }, { quill: 'failing' });
            (await page.getByRole('alert').textContent())!.should.contain('quill is not installed');
            (await page.getByRole('textbox').textContent())!.should.equal('Kept');
        });
    });

    describe('and properties change while the editor is on screen', () => {
        it('should keep the same editor, one toolbar, and what the user typed, through unrelated edits', async () => {
            await show(page, { value: '<p>base</p>', placeholder: 'One' });
            const surface = page.locator('.ql-editor');
            await surface.waitFor();
            await page.evaluate(() => { (document.querySelector('.ql-editor') as unknown as { identity: number }).identity = 42; });
            await surface.click();
            await page.keyboard.press('End');
            await page.keyboard.type('TYPED');

            for (const placeholder of ['Two', 'Three', 'Four']) {
                await show(page, { value: '<p>base</p>', placeholder, ariaLabel: placeholder });
                await page.waitForTimeout(100);
            }

            (await page.locator('.ql-toolbar').count()).should.equal(1);
            (await page.locator('.ql-container').count()).should.equal(1);
            (await surface.innerHTML()).should.equal('<p>baseTYPED</p>');
            (await page.evaluate(() => (document.querySelector('.ql-editor') as unknown as { identity: number }).identity)).should.equal(42);
            (await surface.getAttribute('data-placeholder'))!.should.equal('Four');
        });

        it('should replace the content, without reporting an edit, when the authored value changes', async () => {
            await show(page, { value: '<p>one</p>' });
            await page.locator('.ql-editor').waitFor();
            await show(page, { value: '<p>two</p>' });
            await page.waitForFunction(() => document.querySelector('.ql-editor')!.innerHTML === '<p>two</p>');
            (await page.evaluate(() => (window as unknown as PageWindow).events)).should.deep.equal([]);
        });

        it('should become read only, and editable again, as readOnly changes - with a hostile value that throws nothing', async () => {
            await show(page, { value: hostileHtml, readOnly: false });
            const surface = page.locator('.ql-editor');
            await surface.waitFor();
            (await surface.getAttribute('contenteditable'))!.should.equal('true');

            await show(page, { value: hostileHtml, readOnly: true });
            await page.waitForFunction(() => document.querySelector('.ql-editor')!.getAttribute('contenteditable') === 'false');
            (await page.locator('.ql-toolbar button:not([disabled])').count()).should.equal(0);
            await page.getByText('Read only').waitFor();

            await show(page, { value: hostileHtml, readOnly: false });
            await page.waitForFunction(() => document.querySelector('.ql-editor')!.getAttribute('contenteditable') === 'true');
            (await page.locator('.ql-toolbar button[disabled]').count()).should.equal(0);
            (await page.locator('.ql-editor').count()).should.equal(1);
            (await executed(page)).should.deep.equal([]);
        });

        it('should stop editing for a disabled element as well', async () => {
            await show(page, { value: '<p>x</p>' }, { isEnabled: false });
            const surface = page.locator('.ql-editor');
            await surface.waitFor();
            await page.getByText('Disabled').waitFor();
            (await surface.getAttribute('contenteditable'))!.should.equal('false');
            await surface.click();
            await page.keyboard.type('nope');
            (await surface.innerHTML()).should.equal('<p>x</p>');
        });

        it('should rebuild with exactly one toolbar when the toolbar is switched off and on', async () => {
            await show(page, { value: '<p>x</p>', showHeader: true });
            await page.locator('.ql-editor').waitFor();
            await show(page, { value: '<p>x</p>', showHeader: false });
            await page.waitForFunction(() => document.querySelectorAll('.ql-toolbar').length === 0 && document.querySelectorAll('.ql-editor').length === 1);
            await show(page, { value: '<p>x</p>', showHeader: true });
            await page.waitForFunction(() => document.querySelectorAll('.ql-toolbar').length === 1 && document.querySelectorAll('.ql-editor').length === 1);
        });
    });
});
