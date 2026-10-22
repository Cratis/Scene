// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { build } from 'esbuild';
import { Browser, chromium } from 'playwright-core';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, it } from 'vitest';
import { primeReactThemes } from '../theme/primeReactThemes';

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

describe.each(primeReactThemes)('when rendering the shipped $name preset', theme => {
    it('should keep tag, button and progress value text at normal-text AA contrast', async () => {
        const page = await browser.newPage({ colorScheme: theme.isDark ? 'dark' : 'light' });
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        try {
            page.setDefaultTimeout(10000);
            await page.setContent(`<!doctype html><html lang="en"><head><title>Preset contrast</title></head><body data-test-theme="${theme.name}"><div id="root"></div></body></html>`);
            await page.addStyleTag({ content: css });
            await page.addScriptTag({ content: script });
            await page.waitForSelector(`[data-scene-theme="${theme.name}"]`);
            await page.waitForFunction(() => document.querySelector('[data-scene-id="progress"] [data-part="indicator"]')!.getBoundingClientRect().width > 100);
            await page.evaluate(() => Promise.all(document.getAnimations()
                .filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity)
                .map(animation => animation.finished)));
            const colors = await page.evaluate(() => {
                const style = (selector: string) => getComputedStyle(document.querySelector(selector)!);
                const tag = style('[data-scene-id="tag"]');
                const button = style('[data-scene-id="action"]');
                const progress = style('[data-scene-id="progress"] [data-part="indicator"]');
                const value = style('[data-scene-id="progress"] [data-part="value"]');
                return {
                    tag: [tag.color, tag.backgroundColor],
                    button: [button.color, button.backgroundColor],
                    progress: [value.color, progress.backgroundColor],
                };
            });
            const ratios = Object.entries(colors).map(([control, [foreground, background]]) => {
                const ratio = contrast(foreground, background);
                ratio.should.be.at.least(4.5, `${theme.name} ${control}: ${foreground} on ${background}`);
                return `${control}=${ratio.toFixed(2)}`;
            });
            (await page.locator('[data-scene-id="progress"] [data-part="value"]').textContent())!.should.equal('65%');
            errors.should.deep.equal([]);
            console.info(`${theme.name}: ${ratios.join(' ')}`);
        } finally {
            await page.close();
        }
    });
});

function contrast(foreground: string, background: string): number {
    const luminance = (color: string) => {
        color.should.match(/^rgb\(\d+, \d+, \d+\)$/);
        const [red, green, blue] = color.match(/\d+/g)!.map(value => {
            const channel = Number(value) / 255;
            return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    };
    const text = luminance(foreground);
    const fill = luminance(background);
    return (Math.max(text, fill) + 0.05) / (Math.min(text, fill) + 0.05);
}

const application = `
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { PrimeReactProvider } from '@primereact/core';
import { styles as buttonStyles } from '@primereact/styles/button';
import { styles as tagStyles } from '@primereact/styles/tag';
import { styles as progressBarStyles } from '@primereact/styles/progressbar';
import { SceneThemeProvider } from '@cratis/scene.react';
import { primeReactThemes } from './theme/primeReactThemes';
import { usePrimeReactTheme } from './theme/usePrimeReactTheme';
import { PrimeButton } from './button/PrimeButton';
import { PrimeTag } from './misc/PrimeTag';
import { PrimeProgressBar } from './misc/PrimeProgressBar';
import './primeReactTheme.css';
const props = (id, properties = {}) => ({ element: { id, properties }, slots: {} });
function App() {
    const theme = primeReactThemes.find(candidate => candidate.name === document.body.dataset.testTheme);
    const configuration = usePrimeReactTheme(theme);
    return <PrimeReactProvider {...configuration} defaults={{
        Button: { props: { styles: buttonStyles } },
        Tag: { props: { styles: tagStyles } },
        'ProgressBar.Root': { props: { styles: progressBarStyles } },
    }}>
        <div className={theme.isDark ? 'scene-dark' : undefined}>
            <SceneThemeProvider theme={theme}>
                <PrimeButton {...props('action', { label: 'Save changes' })} />
                <PrimeTag {...props('tag', { value: 'Published' })} />
                <PrimeProgressBar {...props('progress', { value: 65, label: 'Import progress' })} />
            </SceneThemeProvider>
        </div>
    </PrimeReactProvider>;
}
flushSync(() => createRoot(document.getElementById('root')).render(<App />));
`;
