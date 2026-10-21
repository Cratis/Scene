// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import { Browser, Page, chromium } from 'playwright-core';

const packageRoot = resolve(import.meta.dirname, '..', '..');
const entry = `
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { GalleryScreenPreview } from './gallery/GalleryScreenPreview';
import meta from './shell/DefaultShell.stories';
import { defaultBlueprint } from './defaultBlueprint';
import pack from './sampleData/foundation-en.json';
// Keep the published package entry in the graph too: importing the blueprint must not import optional widgets.
window.shellManifest = defaultBlueprint.manifest;
const root = createRoot(document.getElementById('root'));
let revision = 0;
window.resetShell = () => flushSync(() => root.render(<GalleryScreenPreview key={++revision} {...meta.args} pack={pack} />));
window.resetShell();
`;

export interface ShellPage {
    browser: Browser;
    page: Page;
    inputs: string[];
    errors: string[];
}

/** Renders the default-only story with its actual stylesheet and no external widget assets. */
export async function openShellPage(): Promise<ShellPage> {
    const bundle = await build({
        stdin: { contents: entry, loader: 'tsx', resolveDir: packageRoot },
        bundle: true,
        write: false,
        metafile: true,
        platform: 'browser',
        format: 'iife',
        jsx: 'automatic',
        // The story builds its sample-data URL from import.meta, which an IIFE bundle does not have; the harness passes the pack itself.
        define: { 'process.env.NODE_ENV': '"production"', 'import.meta.url': '"http://localhost/"' },
        alias: {
            '@cratis/scene.model': resolve(packageRoot, '..', 'model', 'index.ts'),
            '@cratis/scene.engine': resolve(packageRoot, '..', 'engine', 'index.ts'),
            '@cratis/scene.react': resolve(packageRoot, '..', 'react', 'index.ts'),
        },
    });
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setContent('<!doctype html><html lang="en"><body style="margin:0"><div id="root"></div></body></html>');
    await page.addStyleTag({ content: readFileSync(resolve(packageRoot, 'shell', 'layout.css'), 'utf8') });
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    await page.getByRole('button', { name: 'Settings' }).waitFor();
    return { browser, page, errors, inputs: Object.keys(bundle.metafile!.inputs) };
}
