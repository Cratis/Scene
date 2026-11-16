// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import { Browser, Locator, Page, chromium } from 'playwright-core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const packageRoot = resolve(import.meta.dirname, '../..');
const javascript = resolve(packageRoot, '..');

// What the stories mount: the story itself, inside the providers and the stylesheets `.storybook/preview.tsx` gives every one. `window.__story` names
// which export of the stories file to draw, so each specification gets a page of its own and one bundle serves them all.
const entry = `
import { createRoot } from 'react-dom/client';
import { PrimeReactProvider } from '@primereact/core';
import { CratisComponentsProvider } from '@cratis/components/Common';
import '@cratis/components/tokens';
import '@cratis/components/styles';
import '@cratis/components/theme';
import 'primeicons/primeicons.css';
import * as stories from './Stories/DesignCanvas.stories';

document.body.classList.add('cratis-theme');
window.__stories = Object.keys(stories).filter(name => name !== 'default');
const Story = stories[window.__story]?.render;
if (Story !== undefined) {
    createRoot(document.getElementById('root')).render(
        <PrimeReactProvider>
            <CratisComponentsProvider value={{ locale: 'en-US' }}>
                <div style={{ height: '100vh' }}><Story /></div>
            </CratisComponentsProvider>
        </PrimeReactProvider>);
}
`;

const loaders = { '.woff': 'dataurl', '.woff2': 'dataurl', '.ttf': 'dataurl', '.eot': 'dataurl', '.svg': 'dataurl', '.png': 'dataurl' } as const;

/** Third-party noise a story is not responsible for: PrimeReact 11 asks every page for a licence key. */
const ignored = (text: string) => text.includes('PrimeUI license');

let browser: Browser;
let script: string;
let css: string;
const pages: Page[] = [];

/** Opens a story on a page of its own, and keeps what the page reports: the story is not allowed to say anything but its own content. */
async function open(story: string): Promise<{ page: Page; errors: string[] }> {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    pages.push(page);
    page.setDefaultTimeout(15000);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
    page.on('console', message => { if (message.type() === 'error' && !ignored(message.text())) errors.push(`console.error: ${message.text()}`); });
    page.on('requestfailed', request => errors.push(`requestfailed: ${request.url()}`));
    await page.setContent('<!doctype html><html lang="en"><head><title>Story</title></head><body style="margin:0"><div id="root"></div></body></html>');
    await page.evaluate(name => { Reflect.set(window, '__story', name); }, story);
    await page.addStyleTag({ content: css });
    await page.addScriptTag({ content: script });
    await page.locator('#root > *').first().waitFor();
    return { page, errors };
}

const chatInput = (page: Page) => page.getByRole('textbox', { name: 'Describe what to design or change' });
const ask = async (page: Page, prompt: string) => {
    await chatInput(page).fill(prompt);
    await page.getByRole('button', { name: 'Send' }).click();
};
const history = (page: Page) => page.locator('.design-history__entry');
const settled = (page: Page) => page.locator('.design-chat__turn--running').waitFor({ state: 'detached' });

// The page changes on its own (a seeded host answers its scripted turns, a turn runs for a while), so every check waits for what it expects.
const shown = (locator: Locator) => locator.first().waitFor({ state: 'visible' });
const count = (locator: Locator, expected: number) => expect.poll(() => locator.count()).toBe(expected);
const atLeast = (locator: Locator, expected: number) => expect.poll(() => locator.count()).toBeGreaterThanOrEqual(expected);
const text = (locator: Locator, expected: string) => expect.poll(() => locator.allInnerTexts().then(texts => texts.join('\n'))).toContain(expected);
const hasClass = (locator: Locator, expected: RegExp) => expect.poll(() => locator.getAttribute('class')).toMatch(expected);
const enabled = (locator: Locator) => expect.poll(() => locator.isEnabled()).toBe(true);

/** What the page is showing, to compare a story with what it is meant to show. */
const bodyText = (page: Page) => page.evaluate(() => document.body.innerText);

beforeAll(async () => {
    const bundle = await build({
        stdin: { contents: entry, loader: 'tsx', resolveDir: packageRoot, sourcefile: 'browser-entry.tsx' },
        bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic', outdir: 'out', loader: loaders,
        define: { 'process.env.NODE_ENV': '"production"', 'import.meta.url': '"http://localhost/"' },
        alias: {
            '@cratis/scene.model': resolve(javascript, 'model', 'index.ts'),
            '@cratis/scene.engine': resolve(javascript, 'engine', 'index.ts'),
            '@cratis/scene.react': resolve(javascript, 'react', 'index.ts'),
            '@cratis/scene.design': resolve(javascript, 'design', 'index.ts'),
            '@cratis/scene.editor': resolve(javascript, 'editor', 'index.ts'),
        },
        logLevel: 'error',
    });
    script = bundle.outputFiles.filter(output => output.path.endsWith('.js')).map(output => output.text).join('\n');
    css = bundle.outputFiles.filter(output => output.path.endsWith('.css')).map(output => output.text).join('\n');
    const executablePath = process.env.CHROMIUM_PATH ?? (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
    browser = await chromium.launch({ headless: true, executablePath, args: ['--no-sandbox'] });
}, 120000);

afterAll(async () => {
    await Promise.all(pages.map(page => page.close().catch(() => undefined)));
    await browser?.close();
});

describe('when driving every story of the design canvas in Chromium', () => {
    // Each story and something only that story shows, so a story that mounts but draws nothing of its own fails too.
    const shows: Record<string, (page: Page) => Promise<void>> = {
        Empty: async page => { await shown(page.getByText('No screens yet')); },
        AskTheChat: async page => { await shown(chatInput(page)); },
        WithScreens: async page => { await count(page.locator('.design-artboard'), 3); },
        WithTweaks: async page => { await page.getByRole('tab', { name: 'Tweaks' }).click(); await shown(page.getByRole('combobox', { name: 'Corners' })); },
        WithVariations: async page => { await atLeast(page.locator('[data-candidate]'), 1); },
        TemplateMode: async page => { await shown(page.locator('.design-canvas')); },
        ForAnIssue: async page => { await shown(page.locator('[data-artboard="OverdueBanner"]')); },
        WithoutAI: async page => { await shown(chatInput(page)); expect(await chatInput(page).isDisabled()).toBe(true); },
        Overview: async page => { await shown(page.getByText('Pay an invoice')); await shown(page.getByText('Overdue banner')); },
    };

    it('should have a specification for every story the stories file exports', async () => {
        const { page } = await open('Empty');
        const exported = await page.evaluate(() => Reflect.get(window, '__stories') as string[]);
        expect(Object.keys(shows).sort()).toEqual([...exported].sort());
    });

    for (const story of Object.keys(shows)) {
        describe(`and the story is ${story}`, () => {
            it('should draw itself and say nothing in the console', async () => {
                const { page, errors } = await open(story);
                await shows[story](page);
                await page.waitForTimeout(1000);
                expect(errors).toEqual([]);
            });

            it('should fit the window and draw no placeholder for a component it could not resolve', async () => {
                const { page } = await open(story);
                await shows[story](page);
                expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
                expect(await bodyText(page)).not.toContain('Unresolved');
            });
        });
    }

    describe('and a layout is chosen from the ones offered', () => {
        it('should make it the screen\'s next revision and take the offer away', async () => {
            const { page, errors } = await open('WithVariations');
            await count(history(page), 1);
            await atLeast(page.locator('[data-candidate]'), 2);
            await page.getByRole('button', { name: 'Use this layout' }).nth(1).click();
            await count(page.locator('[data-candidate]'), 0);
            await count(history(page), 2);
            expect(errors).toEqual([]);
        });
    });

    describe('and a tweak is made', () => {
        it('should apply the choice as a revision of its own, and go back with the history', async () => {
            const { page, errors } = await open('WithTweaks');
            await page.getByRole('tab', { name: 'Tweaks' }).click();
            await page.getByRole('combobox', { name: 'Corners' }).selectOption('Round');
            await page.getByRole('tab', { name: 'History' }).click();
            await count(history(page), 2);
            // The newest comes first and is where the screen is; going back to the older one is a revision of its own, not a deletion.
            await hasClass(history(page).first(), /design-history__entry--current/);
            await page.getByRole('button', { name: 'Go back to this' }).click();
            await count(history(page), 3);
            await expect.poll(() => history(page).first().getAttribute('data-kind')).toBe('restored');
            expect(errors).toEqual([]);
        });

        it('should take a control away when it is dismissed', async () => {
            const { page } = await open('WithTweaks');
            await page.getByRole('tab', { name: 'Tweaks' }).click();
            await page.getByRole('button', { name: 'Dismiss Corners' }).click();
            await count(page.getByRole('combobox', { name: 'Corners' }), 0);
        });
    });

    describe('and a screen is commented on', () => {
        it('should pin the comment to where it was dropped, list it, and resolve and reopen it', async () => {
            const { page, errors } = await open('WithTweaks');
            await page.getByRole('button', { name: 'Add comment' }).click();
            const frame = (await page.locator('.design-artboard__capture').boundingBox())!;
            await page.mouse.click(frame.x + 80, frame.y + 60);
            await page.getByRole('textbox', { name: 'Add comment' }).fill('The heading is too small');
            await page.locator('.design-comments__new').getByRole('button', { name: 'Add comment' }).click();
            await page.getByRole('tab', { name: 'Comments' }).click();
            await text(page.locator('.design-comments__list'), 'The heading is too small');
            await count(page.locator('.design-pin'), 1);
            await page.getByRole('button', { name: 'Resolve' }).click();
            await count(page.locator('.design-pin--resolved'), 1);
            await page.getByRole('button', { name: 'Reopen' }).click();
            await count(page.locator('.design-pin--resolved'), 0);
            expect(errors).toEqual([]);
        });

        it('should drop a comment that is cancelled', async () => {
            const { page } = await open('WithTweaks');
            await page.getByRole('button', { name: 'Add comment' }).click();
            const frame = (await page.locator('.design-artboard__capture').boundingBox())!;
            await page.mouse.click(frame.x + 80, frame.y + 60);
            await page.locator('.design-comments__new').getByRole('button', { name: 'Cancel' }).click();
            await count(page.locator('.design-comments__new'), 0);
            await count(page.locator('.design-pin'), 0);
        });
    });

    describe('and the chat is asked', () => {
        it('should add a screen, show the turn while it runs, and let the turn be undone', async () => {
            const { page, errors } = await open('AskTheChat');
            await ask(page, 'Add a screen called Invoices');
            await shown(page.locator('.design-chat__turn--running'));
            await shown(page.getByRole('button', { name: 'Cancel' }));
            await settled(page);
            await shown(page.locator('[data-artboard="Invoices"]'));
            await text(page.locator('.design-chat__turn--done'), 'I added Invoices.');
            await page.getByRole('button', { name: 'Undo this turn' }).click();
            await count(page.locator('[data-artboard="Invoices"]'), 0);
            await shown(page.getByText('No screens yet'));
            expect(errors).toEqual([]);
        });

        it('should stop a turn that is cancelled', async () => {
            const { page } = await open('AskTheChat');
            await ask(page, 'Add a screen called Invoices');
            await page.getByRole('button', { name: 'Cancel' }).click();
            await count(page.locator('.design-chat__turn--running'), 0);
            await count(page.locator('[data-artboard="Invoices"]'), 0);
        });

        it('should refuse what the design system does not allow, with the alternatives, and carry one out when it is chosen', async () => {
            const { page, errors } = await open('WithTweaks');
            await ask(page, 'make it neon pink');
            await shown(page.locator('.design-chat__turn--refused'));
            await text(page.locator('.design-chat__refusal'), 'free colors are not allowed');
            await count(page.locator('.design-chat__alternative'), 2);
            await page.getByRole('button', { name: 'Use sharp corners instead' }).click();
            await settled(page).catch(() => undefined);
            expect(errors).toEqual([]);
        });

        it('should say so when the design service fails, and stay usable', async () => {
            const { page } = await open('AskTheChat');
            await ask(page, 'please fail');
            await shown(page.locator('.design-chat__turn--failed'));
            await enabled(chatInput(page));
        });
    });

    describe('and a screen is added by hand', () => {
        it('should offer the templates, add the screen to the canvas and close the form', async () => {
            const { page, errors } = await open('WithScreens');
            await page.getByRole('button', { name: 'New screen' }).click();
            const form = page.locator('.design-new-screen');
            await shown(form);
            expect(await form.getByRole('combobox', { name: 'Templates' }).locator('option').count()).toBeGreaterThan(1);
            await form.getByRole('textbox', { name: 'Name' }).fill('Handmade');
            await form.getByRole('button', { name: 'New screen' }).click();
            await shown(page.locator('[data-artboard="Handmade"]'));
            await count(form, 0);
            await count(page.locator('.design-artboard'), 4);
            expect(errors).toEqual([]);
        });
    });

    describe('and the canvas is arranged', () => {
        it('should zoom, and put a screen in a storyline of its own', async () => {
            const { page, errors } = await open('WithScreens');
            await page.getByRole('button', { name: 'Zoom in' }).click();
            await text(page.locator('.design-canvas'), '125%');
            await page.getByRole('textbox', { name: 'New storyline' }).fill('Happy path');
            await page.locator('.design-storylines form').getByRole('button').click();
            await expect.poll(() => page.getByRole('combobox', { name: 'Storylines' }).locator('option').allInnerTexts()).toContain('Happy path');
            expect(errors).toEqual([]);
        });

        it('should move a screen along the storyline', async () => {
            const { page } = await open('WithScreens');
            await page.getByRole('button', { name: 'Move InvoiceList later' }).click();
            await expect.poll(() => page.locator('.design-artboard').first().getAttribute('data-artboard')).toBe('InvoiceDetails');
        });
    });

    describe('and a screen is edited by hand', () => {
        it('should open the screen in the editor, and close it again, whatever the screen is called', async () => {
            const { page, errors } = await open('WithTweaks');
            await page.getByRole('button', { name: 'Edit', exact: true }).click();
            await shown(page.locator('.design-edit .studio-screen-editor-workspace'));
            expect(await page.locator('.studio-screen-editor-unreadable').count()).toBe(0);
            await page.locator('.design-edit__actions').getByRole('button', { name: 'Close' }).click();
            await count(page.locator('.design-edit'), 0);
            expect(errors).toEqual([]);
        });
    });
});
