// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import { Browser, Page, chromium } from 'playwright-core';

const packageRoot = resolve(import.meta.dirname, '..');
const entry = `
import { createRoot } from 'react-dom/client';
import { coreComponents } from '@cratis/scene.react';
import { defaultBlueprintComponents } from './defaultBlueprintComponents';
import { defaultLayouts } from './layouts';
import { ScenePreviewHost, previewProfile } from './preview-host';

const document = {
    layouts: defaultLayouts,
    screenTemplates: [],
    screens: [{ name: 'dashboard.overview', layout: 'AppShell', slotContent: { content: [{ id: 'hello', componentName: 'core:text', properties: { text: 'Hello' }, slots: {} }] }, forms: [], contributions: [] }],
    uiProfiles: [previewProfile(undefined)],
};
const structure = { modules: [{ id: 'dashboard', name: 'Dashboard', features: [{ id: 'overview', name: 'Overview', features: [], slices: [] }] }] };
const navigation = { application: { logo: { image: '', title: 'Acme' }, regions: [] }, modules: [] };
createRoot(window.document.getElementById('root')).render(
    <ScenePreviewHost document={document} structure={structure} navigation={navigation} target={{ application: 'Acme' }}
        registry={{ ...coreComponents, ...defaultBlueprintComponents }} />);
`;

// The preview host puts the application's logo in the topbar alone and gives the sidebar none, so the shell must not hide it (Scene#250 review).
describe('when the application logo is only in the topbar in Chromium', () => {
    let browser: Browser;
    let page: Page;
    const errors: string[] = [];

    beforeAll(async () => {
        const bundle = await build({
            stdin: { contents: entry, loader: 'tsx', resolveDir: packageRoot },
            bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic',
            define: { 'process.env.NODE_ENV': '"production"', 'import.meta.url': '"http://localhost/"' },
            alias: {
                '@cratis/scene.model': resolve(packageRoot, '..', 'model', 'index.ts'),
                '@cratis/scene.engine': resolve(packageRoot, '..', 'engine', 'index.ts'),
                '@cratis/scene.react': resolve(packageRoot, '..', 'react', 'index.ts'),
            },
        });
        browser = await chromium.launch({ headless: true });
        page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
        page.on('pageerror', error => errors.push(error.message));
        await page.setContent('<!doctype html><html lang="en"><body style="margin:0"><div id="root"></div></body></html>');
        await page.addStyleTag({ content: readFileSync(resolve(packageRoot, 'shell', 'layout.css'), 'utf8') });
        await page.addScriptTag({ content: bundle.outputFiles[0].text });
        await page.locator('.layout-topbar').waitFor();
    });
    afterAll(async () => { await browser?.close(); });

    it('should render without errors', () => errors.should.deep.equal([]));
    it('should show exactly one visible brand', async () => {
        const visible = await page.locator('.layout-logo').evaluateAll(logos => logos.filter(logo => (logo as HTMLElement).offsetParent !== null).length);
        visible.should.equal(1);
    });
    it('should keep that brand in the topbar', async () => (await page.locator('.layout-topbar .layout-logo').isVisible()).should.equal(true));
});
