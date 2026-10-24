// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { build } from 'esbuild';
import { Browser, Page, chromium } from 'playwright-core';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const workspace = resolve(import.meta.dirname, '..');
const javascript = resolve(workspace, '..');
let browser: Browser;
let script: string;
let css: string;

beforeAll(async () => {
    const bundle = await build({
        stdin: { contents: application, resolveDir: workspace, loader: 'tsx' },
        bundle: true, write: false, outdir: 'out', platform: 'browser', format: 'iife', jsx: 'automatic',
        define: { 'process.env.NODE_ENV': '"production"' },
        alias: {
            '@cratis/scene.model': resolve(javascript, 'model/index.ts'),
            '@cratis/scene.engine': resolve(javascript, 'engine/index.ts'),
            '@cratis/scene.react': resolve(javascript, 'react/index.ts'),
        },
    });
    script = bundle.outputFiles.find(file => file.path.endsWith('.js'))!.text;
    css = bundle.outputFiles.find(file => file.path.endsWith('.css'))!.text;
    const executablePath = process.env.CHROMIUM_PATH ?? (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
    browser = await chromium.launch({ headless: true, executablePath, args: ['--no-sandbox'] });
});

afterAll(async () => { await browser?.close(); });

async function show(mode: 'covered' | 'real'): Promise<Page> {
    const page = await browser.newPage();
    page.setDefaultTimeout(5000);
    await page.setContent(`<!doctype html><html lang="en"><head><title>Dialog calendar</title></head><body data-mode="${mode}"><div id="root"></div></body></html>`);
    await page.addStyleTag({ content: css });
    await page.addScriptTag({ content: script });
    await page.getByRole('textbox', { name: 'Name' }).fill('Unsaved draft');
    return page;
}

const dialog = (page: Page) => page.locator('[data-scope="dialog"][data-part="popup"]');

describe('when clicking a portaled popover', () => {
    it('should keep the dialog and draft when its positioner covers a Cratis popover at the click point', async () => {
        const page = await show('covered');
        try {
            await page.getByRole('button', { name: 'Open calendar' }).click();
            const popover = page.locator('[data-cratis-part="popover"]');
            const box = (await popover.boundingBox())!;
            const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
            const hits = await page.evaluate(({ x, y }) => document.elementsFromPoint(x, y).map(node => ({
                primePart: node.getAttribute('data-part'),
                cratisPart: node.getAttribute('data-cratis-part'),
            })), point);
            hits[0].primePart!.should.equal('positioner');
            hits.some(hit => hit.cratisPart === 'popover').should.equal(true);
            // Browser hit-testing dispatches to the covering dialog surface, not the portal node.
            await page.mouse.click(point.x, point.y);
            ((await dialog(page).getAttribute('data-open')) !== null).should.equal(true);
            (await page.getByRole('textbox', { name: 'Name' }).inputValue()).should.equal('Unsaved draft');
        } finally {
            await page.close();
        }
    });

    it('should still dismiss for an outside click away from the open popover', async () => {
        const page = await show('covered');
        try {
            await page.getByRole('button', { name: 'Open calendar' }).click();
            const positioner = page.locator('[data-scope="dialog"][data-part="positioner"]');
            const box = (await positioner.boundingBox())!;
            await page.mouse.click(box.x + box.width - 10, box.y + box.height - 10);
            await dialog(page).waitFor({ state: 'hidden' });
        } finally {
            await page.close();
        }
    });

    it('should select a date with the real Cratis DatePickerInput without dismissing the dialog', async () => {
        const page = await show('real');
        try {
            await page.locator('[data-cratis-part="trigger"]').click();
            const cell = page.locator('[data-cratis-part="cell"]').filter({ hasText: /^16$/ });
            await cell.click();
            (await page.getByLabel('Selected day').textContent())!.should.equal('16');
            ((await dialog(page).getAttribute('data-open')) !== null).should.equal(true);
            (await page.getByRole('textbox', { name: 'Name' }).inputValue()).should.equal('Unsaved draft');
        } finally {
            await page.close();
        }
    });
});

const application = `
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { PrimeReactProvider } from '@primereact/core';
import { styles as dialogStyles } from '@primereact/styles/dialog';
import Lara from '@primeuix/themes/lara';
import { DatePickerInput } from '@cratis/components/Common';
import '@cratis/components/tokens';
import '@cratis/components/Common/styles';
import { PrimeDialog } from './overlay/PrimeDialog';
function CoveredPopover() {
    const [open, setOpen] = useState(false);
    return <>
        <button type='button' aria-controls='calendar' onClick={() => setOpen(true)}>Open calendar</button>
        {open && createPortal(<div id='calendar' data-cratis-part='popover' role='dialog' aria-label='Calendar'
            style={{ position: 'fixed', left: 20, bottom: 100, width: 240, height: 140, zIndex: 1000 }}>
            <button type='button'>16</button>
        </div>, document.body)}
    </>;
}
function App() {
    const [date, setDate] = useState(new Date(2026, 9, 15));
    return <PrimeReactProvider defaults={{ 'Dialog.Root': { props: { styles: dialogStyles } } }} theme={{ preset: Lara }}>
        <PrimeDialog element={{ id: 'edit', properties: { visible: true, header: 'Edit order' } }} slots={{ content: [
            <input key='name' aria-label='Name' defaultValue='Draft' />,
            document.body.dataset.mode === 'covered' ? <CoveredPopover key='date' /> :
                <DatePickerInput key='date' value={date} onChange={setDate} aria-label='Due date' />,
            <output key='selected' aria-label='Selected day'>{date.getDate()}</output>,
        ] }} />
    </PrimeReactProvider>;
}
createRoot(document.getElementById('root')).render(<App />);
`;
