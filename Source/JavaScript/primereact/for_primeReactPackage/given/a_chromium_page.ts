// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { resolve } from 'node:path';
import { build } from 'esbuild';
import { Browser, BrowserContext, Page, chromium } from 'playwright-core';

const packageRoot = resolve(import.meta.dirname, '..', '..');

/**
 * The entry the page runs: a `show(component, properties)` function that renders one Scene control from this
 * package's source into the page, and renders it again into the same root when called a second time, the way
 * a document edit re-renders a control that is already on screen.
 */
const entry = `
import 'quill/dist/quill.snow.css';
import './primeReactTheme.css';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { PrimeReactProvider } from '@primereact/core';
import { PrimeChart } from './chart/PrimeChart';
import { PrimeDataScroller } from './data/PrimeDataScroller';
import { PrimeTreeTable } from './data/PrimeTreeTable';
import { PrimeEditor } from './editor/PrimeEditor';
import { QuillLoaderProvider } from './editor/QuillLoaderProvider';
import { FileUploadHandlerProvider } from './file/FileUploadHandlerProvider';
import { PrimeFileUpload } from './file/PrimeFileUpload';
import { PrimeMultiStateCheckbox } from './form/PrimeMultiStateCheckbox';
import { loadQuill } from './loadQuill';
import { sceneComponent } from './storyElements';

const components = {
    chart: PrimeChart,
    dataScroller: PrimeDataScroller,
    editor: PrimeEditor,
    fileUpload: PrimeFileUpload,
    multiStateCheckbox: PrimeMultiStateCheckbox,
    treeTable: PrimeTreeTable,
};
let root;

// What the page records, for a specification to read back.
window.events = [];
window.uploads = [];

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const quillLoaders = {
    real: loadQuill,
    slow: async () => { await wait(600); return loadQuill(); },
    failing: () => Promise.reject(new Error('quill is not installed')),
};
const handlers = {
    record: async (files, url) => { window.uploads.push({ names: files.map(file => file.name), url }); },
    slow: async (files, url) => { await wait(300); window.uploads.push({ names: files.map(file => file.name), url }); },
    failing: async () => { throw new Error('the host refused the upload'); },
};

/**
 * Renders one Scene control from this package's source, and renders it again into the same root when called a
 * second time - the way a document edit re-renders a control that is already on screen.
 *
 * options: isEnabled, slots (not supported here), quill ('real' | 'slow' | 'failing' | 'none', default 'real'),
 * handler ('record' | 'slow' | 'failing', default none), allowedOrigins.
 */
window.show = (component, properties, size, options = {}) => {
    root ??= createRoot(document.getElementById('root'));
    const Component = components[component];
    const element = { ...sceneComponent('subject', component, properties), name: 'Subject', size: size ?? {}, isEnabled: options.isEnabled ?? true };
    const interactions = { onChange: () => window.events.push('change'), onSelect: () => window.events.push('select') };
    let tree = <Component element={element} slots={{}} interactions={interactions} />;
    if ((options.quill ?? 'real') !== 'none') tree = <QuillLoaderProvider loader={quillLoaders[options.quill ?? 'real']}>{tree}</QuillLoaderProvider>;
    tree = <FileUploadHandlerProvider handler={options.handler === undefined ? undefined : handlers[options.handler]} allowedOrigins={options.allowedOrigins}>{tree}</FileUploadHandlerProvider>;
    flushSync(() => root.render(<PrimeReactProvider>{tree}</PrimeReactProvider>));
};
window.hide = () => { root?.unmount(); root = undefined; window.events = []; window.uploads = []; };
`;

let bundle: Promise<Bundle> | undefined;

/** The bundled script and the stylesheet that came with it (Quill's and the theme's). */
interface Bundle {
    script: string;
    styles: string;
}

/** Bundles the control sources, once, exactly as a host application's bundler would: Chart.js and Quill included. */
function bundled(): Promise<Bundle> {
    bundle ??= build({
        stdin: { contents: entry, resolveDir: packageRoot, loader: 'tsx', sourcefile: 'chromium-entry.tsx' },
        bundle: true,
        write: false,
        outdir: resolve(packageRoot, '.chromium-out'),
        format: 'iife',
        platform: 'browser',
        jsx: 'automatic',
        define: { 'process.env.NODE_ENV': '"production"' },
        logLevel: 'error',
    }).then(result => ({
        script: result.outputFiles.find(file => file.path.endsWith('.js'))!.text,
        styles: result.outputFiles.filter(file => file.path.endsWith('.css')).map(file => file.text).join('\n'),
    }));
    return bundle;
}

/** A real headless Chromium page with the Scene controls loaded, for specifications that need painted pixels. */
export interface ChromiumPage {
    browser: Browser;
    context: BrowserContext;
    page: Page;

    /** The uncaught errors the page raised, which a specification asserts are none. */
    errors: string[];
}

/** How the page is opened. */
export interface ChromiumPageOptions {
    /**
     * Serves the page from this origin (`https://app.test`) instead of `about:blank`, whose origin is opaque.
     * Nothing is requested from the network: the page itself is answered in the browser, and a specification
     * answers the other requests it cares about with `page.route`.
     */
    origin?: string;
}

const html = '<!doctype html><html><body style="margin:0"><div id="root"></div></body></html>';

/**
 * Launches Chromium and loads the controls. It fails loudly when Chromium is not installed - these
 * specifications are not skipped, because a skipped browser specification proves nothing. Install the
 * browser with `yarn playwright-core install chromium`.
 */
export async function openChromiumPage(options: ChromiumPageOptions = {}): Promise<ChromiumPage> {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 800, height: 600 } });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    if (options.origin === undefined) {
        await page.setContent(html);
    } else {
        await page.route(`${options.origin}/`, route => route.fulfill({ contentType: 'text/html', body: html }));
        await page.goto(`${options.origin}/`);
    }

    const { script, styles } = await bundled();
    await page.addStyleTag({ content: styles });
    await page.addScriptTag({ content: script });
    return { browser, context, page, errors };
}
