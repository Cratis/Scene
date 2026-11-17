// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import { Browser, Locator, Page, chromium } from 'playwright-core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const packageRoot = resolve(import.meta.dirname, '../../');
const javascript = resolve(packageRoot, '..');

// What the stories mount: the story's component with the story's arguments, inside the providers and the stylesheets `.storybook/preview.tsx` gives every
// one. `window.__story` names which export of the stories file to draw, so each specification gets a page of its own and one bundle serves them all.
const entry = `
import { createRoot } from 'react-dom/client';
import { PrimeReactProvider } from '@primereact/core';
import { CratisComponentsProvider } from '@cratis/components/Common';
import '@cratis/components/tokens';
import '@cratis/components/styles';
import '@cratis/components/theme';
import 'primeicons/primeicons.css';
import * as stories from './DesignSystem/DesignSystemEditor.stories';

document.body.classList.add('cratis-theme');
window.__stories = Object.keys(stories).filter(name => name !== 'default');
const Story = stories.default.component;
const story = stories[window.__story];
if (story !== undefined) {
    createRoot(document.getElementById('root')).render(
        <PrimeReactProvider>
            <CratisComponentsProvider value={{ locale: 'en-US' }}>
                <div style={{ padding: '1rem', maxWidth: '72rem' }}><Story {...story.args} /></div>
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
    await page.locator('.studio-design-system').waitFor();
    return { page, errors };
}

// The page changes on its own (the host answers asynchronously), so every check waits for what it expects.
const shown = (locator: Locator) => locator.first().waitFor({ state: 'visible' });
const count = (locator: Locator, expected: number) => expect.poll(() => locator.count()).toBe(expected);
const text = (locator: Locator, expected: string) => expect.poll(() => locator.allInnerTexts().then(texts => texts.join('\n'))).toContain(expected);
const notText = (locator: Locator, unexpected: string) => expect.poll(() => locator.allInnerTexts().then(texts => texts.join('\n'))).not.toContain(unexpected);

const section = (page: Page, name: string) => page.getByRole('navigation', { name: 'Design system sections' }).getByRole('button', { name, exact: true });
const content = (page: Page) => page.locator('.studio-design-system__content');
const value = (page: Page, token: string) => page.getByRole('textbox', { name: `Value of ${token}` });
const confirm = (page: Page) => page.getByRole('button', { name: 'Yes', exact: true });

beforeAll(async () => {
    const bundle = await build({
        stdin: { contents: entry, loader: 'tsx', resolveDir: packageRoot, sourcefile: 'browser-entry.tsx' },
        bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic', outdir: 'out', loader: loaders,
        define: { 'process.env.NODE_ENV': '"production"', 'import.meta.url': '"http://localhost/"' },
        alias: {
            '@cratis/scene.model': resolve(javascript, 'model', 'index.ts'),
            '@cratis/scene.engine': resolve(javascript, 'engine', 'index.ts'),
            '@cratis/scene.react': resolve(javascript, 'react', 'index.ts'),
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

describe('when driving every story of the design system editor in Chromium', () => {
    // Each story and something only that story shows, so a story that mounts but draws nothing of its own fails too.
    const shows: Record<string, (page: Page) => Promise<void>> = {
        Active: async page => { await shown(page.getByText('Golden standard v1')); await shown(page.getByRole('button', { name: 'Start a draft' })); },
        OffTheStandard: async page => { await shown(page.getByText('Orders').first()); await shown(page.getByText('#123456').first()); },
        Draft: async page => { await shown(value(page, 'color.primary')); },
        ReviewingADraft: async page => { await shown(page.getByText('Conflicts to decide')); await shown(page.getByRole('button', { name: 'Activate v2' })); },
        PreviewUnavailable: async page => { await shown(page.getByText(/Previewing needs a browser service/)); expect(await page.getByRole('button', { name: 'Activate v2' }).isDisabled()).toBe(true); },
        HostRefuses: async page => { await shown(page.getByRole('textbox', { name: 'Text of voice tone' })); },
        NoDesignSystem: async page => { await shown(page.getByText('There is no design system yet')); await shown(page.getByRole('button', { name: 'Start from the starter' })); },
    };

    it('should have a specification for every story the stories file exports', async () => {
        const { page } = await open('Active');
        const exported = await page.evaluate(() => Reflect.get(window, '__stories') as string[]);
        expect(Object.keys(shows).sort()).toEqual([...exported].sort());
    });

    for (const story of Object.keys(shows)) {
        describe(`and the story is ${story}`, () => {
            it('should draw itself and say nothing in the console', async () => {
                const { page, errors } = await open(story);
                await shows[story](page);
                await page.waitForTimeout(800);
                expect(errors).toEqual([]);
            });

            it('should fit the window', async () => {
                const { page } = await open(story);
                await shows[story](page);
                expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
            });
        });
    }

    describe('and the active version is read', () => {
        it('should draw every section without a console error', async () => {
            const { page, errors } = await open('Active');
            for (const name of ['Color', 'Type', 'Spacing & radius', 'Elevation & motion', 'Themes', 'Components', 'UI profile, layouts & templates', 'Voice & naming', 'Overview']) {
                await section(page, name).click();
                await shown(content(page).locator('h2, h3, [class*=title]').first());
            }
            expect(errors).toEqual([]);
        });

        it('should change what it draws when another theme or mode is chosen', async () => {
            const { page } = await open('Active');
            await section(page, 'Color').click();
            await text(content(page), '#f8fafc');
            await page.getByRole('button', { name: 'Dark', exact: true }).click();
            await notText(content(page), '#f8fafc');
            await page.getByRole('button', { name: 'Light', exact: true }).click();
            await text(content(page), '#f8fafc');
            await page.getByRole('button', { name: 'Brand', exact: true }).click();
            await notText(content(page), '#1d4ed8');
        });

        it('should offer nothing to change while no draft is open', async () => {
            const { page } = await open('Active');
            await section(page, 'Color').click();
            await text(content(page), '#1d4ed8');
            await count(content(page).getByRole('textbox'), 0);
            await section(page, 'Themes').click();
            await count(page.getByRole('textbox', { name: 'New theme name' }), 0);
        });
    });

    describe('and a draft is started', () => {
        it('should ask first, open the draft, and say so', async () => {
            const { page, errors } = await open('Active');
            await page.getByRole('button', { name: 'Start a draft' }).click();
            await text(page.locator('.studio-design-system__confirmation-actions').locator('..'), 'Start a draft?');
            await confirm(page).click();
            await text(page.locator('.studio-design-system__note'), 'Started a draft');
            await shown(page.getByText('Draft v2 by ada'));
            await shown(page.getByRole('button', { name: 'Open draft' }));
            expect(errors).toEqual([]);
        });

        it('should start nothing when the question is answered no', async () => {
            const { page } = await open('Active');
            await page.getByRole('button', { name: 'Start a draft' }).click();
            await page.getByRole('button', { name: 'No', exact: true }).click();
            await count(page.getByText('Draft v2 by ada'), 0);
            await shown(page.getByRole('button', { name: 'Start a draft' }));
        });

        it('should start from the starter when there is no design system yet', async () => {
            const { page, errors } = await open('NoDesignSystem');
            await page.getByRole('button', { name: 'Start from the starter' }).click();
            await confirm(page).click();
            await shown(page.getByText(/Draft v1 by ada/));
            expect(errors).toEqual([]);
        });
    });

    describe('and a draft is changed by address', () => {
        it('should keep a color that was changed, and show it where it is read', async () => {
            const { page, errors } = await open('Draft');
            await section(page, 'Color').click();
            await value(page, 'color.primary').fill('#ff0000');
            await value(page, 'color.primary').press('Enter');
            await section(page, 'Type').click();
            await section(page, 'Color').click();
            await expect.poll(() => value(page, 'color.primary').inputValue()).toBe('#ff0000');
            await section(page, 'Overview').click();
            await shown(page.getByLabel(/is #ff0000/).first());
            expect(errors).toEqual([]);
        });

        it('should keep what was changed in the words', async () => {
            const { page } = await open('Draft');
            await section(page, 'Voice & naming').click();
            const field = page.getByRole('textbox', { name: 'Text of voice tone' });
            await field.fill('Warm and direct');
            await field.press('Enter');
            await section(page, 'Color').click();
            await section(page, 'Voice & naming').click();
            await expect.poll(() => field.inputValue()).toBe('Warm and direct');
        });

        it('should add a theme as a copy, make it the default and remove it', async () => {
            const { page, errors } = await open('Draft');
            await section(page, 'Themes').click();
            await page.getByRole('textbox', { name: 'New theme name' }).fill('Night');
            await page.getByRole('button', { name: /Add as a copy of/ }).click();
            await shown(content(page).getByText('Night', { exact: true }));
            await count(page.getByRole('button', { name: 'Make default' }), 2);
            await page.getByRole('button', { name: 'Make default' }).last().click();
            await expect.poll(() => page.getByRole('button', { name: 'Remove' }).count()).toBeGreaterThan(0);
            await page.getByRole('button', { name: 'Remove' }).first().click();
            expect(errors).toEqual([]);
        });

        it('should list the change in the draft', async () => {
            const { page } = await open('Draft');
            await section(page, 'Color').click();
            await value(page, 'color.primary').fill('#ff0000');
            await value(page, 'color.primary').press('Enter');
            await section(page, 'Changes in draft').click();
            await text(content(page), 'color.primary');
            await notText(content(page), 'Nothing differs');
        });

        it('should say a refusal, and keep what was typed so it can be corrected', async () => {
            const { page, errors } = await open('HostRefuses');
            const field = page.getByRole('textbox', { name: 'Text of voice tone' });
            await field.fill('Loud');
            await field.press('Enter');
            await text(page.getByRole('alert'), 'Drafts are frozen while a release is cut.');
            expect(await field.inputValue()).toBe('Loud');
            expect(errors).toEqual([]);
        });
    });

    describe('and a draft is reviewed', () => {
        it('should decide a conflict, keeping the value chosen', async () => {
            const { page, errors } = await open('ReviewingADraft');
            await page.getByRole('button', { name: 'Keep #cbd5e1' }).click();
            await text(content(page), 'Every conflict is decided.');
            await text(content(page), 'Decided by ada');
            expect(errors).toEqual([]);
        });

        it('should draw the preview of the screens', async () => {
            const { page } = await open('ReviewingADraft');
            await page.getByRole('button', { name: 'Preview on screens' }).first().click();
            await text(content(page), 'AppShell');
            await text(content(page), 'Text on the card reads 2.1:1 in dark mode');
        });

        it('should not let the person who wrote a draft activate it, and say who can', async () => {
            const { page } = await open('ReviewingADraft');
            expect(await page.getByRole('button', { name: 'Activate v2' }).isDisabled()).toBe(true);
            await text(content(page), 'You wrote part of this draft.');
        });

        it('should ask first, and discard the draft', async () => {
            const { page, errors } = await open('ReviewingADraft');
            await page.getByRole('button', { name: 'Discard draft' }).click();
            await text(page.locator('.studio-design-system'), 'Discard draft v2?');
            await confirm(page).click();
            await text(page.locator('.studio-design-system__note'), 'Discarded draft v2');
            await shown(page.getByRole('button', { name: 'Start a draft' }));
            await count(page.getByText('Draft v2 by ada'), 0);
            expect(errors).toEqual([]);
        });
    });

    describe('and what is off the standard is read', () => {
        it('should list the screens that have a value of their own', async () => {
            const { page, errors } = await open('OffTheStandard');
            await text(content(page), 'Orders');
            await text(content(page), 'Invoices');
            expect(errors).toEqual([]);
        });
    });
});
