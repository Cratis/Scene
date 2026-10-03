// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { resolve } from 'node:path';
import { build } from 'esbuild';
import { Browser, Page, chromium } from 'playwright-core';

const packageRoot = resolve(import.meta.dirname, '..', '..');

/**
 * The entry the page runs: a `show(component, properties)` function that renders one Scene control from this
 * package's source into the page, and renders it again into the same root when called a second time, the way
 * a document edit re-renders a control that is already on screen.
 */
const entry = `
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { PrimeChart } from './chart/PrimeChart';
import { PrimeMultiStateCheckbox } from './form/PrimeMultiStateCheckbox';
import { sceneComponent } from './storyElements';

const components = { chart: PrimeChart, multiStateCheckbox: PrimeMultiStateCheckbox };
let root;

window.show = (component, properties, size) => {
    root ??= createRoot(document.getElementById('root'));
    const Component = components[component];
    const element = { ...sceneComponent('subject', component, properties), name: 'Subject', size: size ?? {} };
    flushSync(() => root.render(<Component element={element} slots={{}} />));
};
window.hide = () => { root?.unmount(); root = undefined; };
`;

let bundle: Promise<string> | undefined;

/** Bundles the control sources, once, exactly as a host application's bundler would: Chart.js included. */
function bundled(): Promise<string> {
    bundle ??= build({
        stdin: { contents: entry, resolveDir: packageRoot, loader: 'tsx', sourcefile: 'chromium-entry.tsx' },
        bundle: true,
        write: false,
        format: 'iife',
        platform: 'browser',
        jsx: 'automatic',
        define: { 'process.env.NODE_ENV': '"production"' },
        logLevel: 'error',
    }).then(result => result.outputFiles[0].text);
    return bundle;
}

/** A real headless Chromium page with the Scene controls loaded, for specifications that need painted pixels. */
export interface ChromiumPage {
    browser: Browser;
    page: Page;

    /** The uncaught errors the page raised, which a specification asserts are none. */
    errors: string[];
}

/**
 * Launches Chromium and loads the controls. It fails loudly when Chromium is not installed - these
 * specifications are not skipped, because a skipped browser specification proves nothing. Install the
 * browser with `yarn playwright-core install chromium`.
 */
export async function openChromiumPage(): Promise<ChromiumPage> {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setContent('<!doctype html><html><body style="margin:0"><div id="root"></div></body></html>');
    await page.addScriptTag({ content: await bundled() });
    return { browser, page, errors };
}
