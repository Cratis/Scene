// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { resolve } from 'node:path';
import { build } from 'esbuild';
import { Browser, Page, chromium } from 'playwright-core';

const packageRoot = resolve(import.meta.dirname, '../../..');

// The editor mounted the way a host with nothing of its own mounts it: Scene's defaults for the words, the layouts, the icons and
// the palette, the providers the components inside a screen need, an environment built from a runtime and nothing else.
const entry = `
import { createRoot } from 'react-dom/client';
import { CratisComponentsProvider } from '@cratis/components/Common';
import 'primeicons/primeicons.css';
import '@cratis/components/tokens';
import '@cratis/components/styles';
import '@cratis/components/theme';
import { ScreenEditorPrimeReactProvider } from './ScreenEditor/Host/ScreenEditorPrimeReactProvider';
import { ScreenEditorWorkspace } from './ScreenEditor/Host/ScreenEditorWorkspace';
import { createScreenEditorEnvironment } from './ScreenEditor/Host/createScreenEditorEnvironment';
import { screenEditorRuntimeForProfile } from './ScreenEditor/Runtime/screenEditorRuntimeForProfile';
import { defaultScreenEditorStrings } from './ScreenEditor/Defaults/defaultScreenEditorStrings';
import { defaultLayoutLabels } from './ScreenEditor/Defaults/defaultLayoutLabels';
import { defaultPaletteIcons } from './ScreenEditor/Defaults/defaultPaletteIcons';
import { defaultPaletteSources } from './ScreenEditor/Defaults/defaultPaletteSources';
import { createExternalComponent } from './ScreenEditor/Document/createExternalComponent';
import { createPanel } from './ScreenEditor/Document/createPanel';
import { createScreenDocument } from './ScreenEditor/Document/studioScreen';
import { LayoutItem } from './ScreenEditor/Layouts/LayoutItem';

const root = createPanel(LayoutItem.Stack, 'screen-root', 'Screen', [createExternalComponent('greeting', 'Greeting', 'text', { text: 'Hello from the screen' })]);
const subject = { document: createScreenDocument(root) };
const environment = createScreenEditorEnvironment({ runtime: screenEditorRuntimeForProfile(undefined, undefined), richText: false });
const results = [];
window.__results = results;

createRoot(document.getElementById('root')).render(
    <ScreenEditorPrimeReactProvider>
        <CratisComponentsProvider value={{ locale: 'en-US' }}>
            <main style={{ height: '100vh' }}>
                <ScreenEditorWorkspace
                    subject={subject}
                    environment={environment}
                    strings={defaultScreenEditorStrings}
                    layoutLabels={defaultLayoutLabels}
                    icons={defaultPaletteIcons}
                    paletteSources={defaultPaletteSources}
                    onChange={result => results.push(result)} />
            </main>
        </CratisComponentsProvider>
    </ScreenEditorPrimeReactProvider>);
`;

const loaders = { '.woff': 'dataurl', '.woff2': 'dataurl', '.ttf': 'dataurl', '.eot': 'dataurl', '.svg': 'dataurl', '.png': 'dataurl' } as const;

describe('when mounting the editor with nothing from the host but its environment in Chromium', () => {
    let browser: Browser;
    let page: Page;
    const errors: string[] = [];

    beforeAll(async () => {
        const bundle = await build({
            stdin: { contents: entry, loader: 'tsx', resolveDir: packageRoot, sourcefile: 'browser-entry.tsx' },
            bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic', outdir: 'out', loader: loaders,
            define: { 'process.env.NODE_ENV': '"production"', 'import.meta.url': '"http://localhost/"' },
            alias: {
                '@cratis/scene.model': resolve(packageRoot, '..', 'model', 'index.ts'),
                '@cratis/scene.engine': resolve(packageRoot, '..', 'engine', 'index.ts'),
                '@cratis/scene.react': resolve(packageRoot, '..', 'react', 'index.ts'),
            },
            logLevel: 'error',
        });
        browser = await chromium.launch({ headless: true });
        page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
        page.on('pageerror', error => errors.push(error.message));
        await page.setContent('<!doctype html><html lang="en"><body style="margin:0"><div id="root"></div></body></html>');
        for (const file of bundle.outputFiles.filter(output => output.path.endsWith('.css'))) await page.addStyleTag({ content: file.text });
        for (const file of bundle.outputFiles.filter(output => output.path.endsWith('.js'))) await page.addScriptTag({ content: file.text });
        await page.locator('.studio-screen-editor-workspace').waitFor();
    });
    afterAll(async () => { await browser?.close(); });

    it('should mount without errors', () => errors.should.deep.equal([]));
    it('should draw the screen it was given', async () => (await page.getByText('Hello from the screen').first().isVisible()).should.be.true);
    it('should offer the structure of the screen', async () => {
        await page.getByRole('tab', { name: 'Structure' }).click();
        (await page.getByRole('treeitem').filter({ hasText: 'Greeting' }).first().isVisible()).should.be.true;
    });
    it('should select an element of the structure', async () => {
        const item = page.getByRole('treeitem').filter({ hasText: 'Greeting' }).first();
        await item.click();
        String(await item.getAttribute('aria-selected')).should.equal('true');
    });
    it('should show the properties of what is selected', async () => {
        await page.getByRole('tab', { name: 'Properties' }).click();
        await page.locator('.studio-editor-properties').waitFor();
        (await page.locator('.studio-editor-properties').isVisible()).should.be.true;
    });
});
