// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { resolve } from 'node:path';
import { build } from 'esbuild';
import { Browser, chromium } from 'playwright-core';

const packageRoot = resolve(import.meta.dirname, '..');

// Exercise the actual Storybook decorator, not a second copy of the provider example: passing the
// configuration as value= renders the button but never emits the preset's --p-* custom properties.
const entry = `
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Button } from 'primereact/button';
import preview from './.storybook/preview';

const ThemedStory = () => preview.decorators[0](() => <Button>Save</Button>);
flushSync(() => createRoot(document.getElementById('root')).render(<ThemedStory />));
`;

describe('when theming a story in Chromium', () => {
    let browser: Browser | undefined;
    let primaryColor: string;
    const errors: string[] = [];

    beforeEach(async () => {
        const bundle = await build({
            stdin: { contents: entry, resolveDir: packageRoot, loader: 'tsx', sourcefile: 'themed-story-entry.tsx' },
            bundle: true,
            write: false,
            outdir: resolve(packageRoot, '.chromium-out'),
            format: 'iife',
            platform: 'browser',
            loader: { '.woff2': 'dataurl', '.woff': 'dataurl', '.ttf': 'dataurl', '.eot': 'dataurl', '.svg': 'dataurl' },
            jsx: 'automatic',
            define: { 'process.env.NODE_ENV': '"production"' },
            logLevel: 'error',
        });
        browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        errors.length = 0;
        page.on('pageerror', error => errors.push(error.message));
        await page.setContent('<!doctype html><html><body><div id="root"></div></body></html>');
        for (const styles of bundle.outputFiles.filter(file => file.path.endsWith('.css'))) {
            await page.addStyleTag({ content: styles.text });
        }
        await page.addScriptTag({ content: bundle.outputFiles.find(file => file.path.endsWith('.js'))!.text });
        const button = page.getByRole('button', { name: 'Save', exact: true });
        await button.waitFor({ state: 'visible' });
        primaryColor = await button.evaluate(element => getComputedStyle(element).getPropertyValue('--p-primary-color').trim());
    });

    afterEach(async () => { await browser?.close(); });

    it('should apply the hook configuration as provider props so the button inherits Lara blue', () => {
        errors.should.deep.equal([]);
        // The preset emits a light/dark pair, e.g. light-dark(#3b82f6,#60a5fa); value= leaves it empty.
        primaryColor.should.contain('#3b82f6');
    });
});
