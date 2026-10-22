// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { build } from 'esbuild';
import { chromium } from 'playwright-core';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

const workspace = resolve(import.meta.dirname, '..');
const javascript = resolve(workspace, '..');
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
});

describe.each(['light', 'dark'] as const)('when PrimeReact controls share the %s Aria shell theme', scheme => {
    it('should use the blueprint primary, surface and text pairs without contrast failures', async () => {
        const executablePath = process.env.CHROMIUM_PATH ?? (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
        const browser = await chromium.launch({ headless: true, executablePath, args: ['--no-sandbox'] });
        try {
            const page = await browser.newPage({ colorScheme: scheme });
            const errors: string[] = [];
            page.on('pageerror', error => errors.push(error.message));
            page.setDefaultTimeout(10000);
            await page.setContent('<!doctype html><html lang="en"><head><title>Mixed libraries</title></head><body><div id="root"></div></body></html>');
            await page.addStyleTag({ content: css });
            await page.addScriptTag({ content: script });
            expect(errors).toEqual([]);
            const progressValue = await page.waitForSelector('[data-scene-id="progress"] [data-part="label"] [data-part="value"]');
            expect(await progressValue!.textContent()).toBe('65%');
            expect(await page.locator('[data-scene-id="progress"]').getAttribute('aria-label')).toBe('Import progress');
            expect(await page.locator('[data-scene-id="progress"]').getAttribute('aria-valuenow')).toBe('65');
            await page.evaluate(value => { document.querySelector<HTMLButtonElement>(`[data-test-theme="${value}"]`)!.click(); }, scheme);
            await page.waitForSelector(`[data-scene-color-scheme="${scheme}"]`);
            await page.waitForFunction(() => document.querySelector('[data-scene-id="progress"] [data-part="indicator"]')!.getBoundingClientRect().width > 100);
            await page.evaluate(() => Promise.all(document.getAnimations().map(animation => animation.finished)));
            const colors = await page.evaluate(() => {
                const themed = document.querySelector<HTMLElement>('[data-scene-theme-root]')!;
                const token = (name: string) => getComputedStyle(themed).getPropertyValue(name).trim();
                const style = (selector: string) => getComputedStyle(document.querySelector(selector)!);
                return {
                    primary: token('--scene-primary-color'), contrast: token('--scene-primary-contrast-color'),
                    legacyPrimary: token('--primary-color'), legacyText: token('--text-color'),
                    text: token('--scene-text-color'), card: token('--scene-surface-card'),
                    button: style('[data-scene-id="action"]').backgroundColor,
                    buttonText: style('[data-scene-id="action"]').color,
                    cardBackground: style('[data-scene-id="card"]').backgroundColor,
                    prose: style('[data-scene-id="prose"]').color,
                    progress: style('[data-scene-id="progress"] [data-part="indicator"]').backgroundColor,
                    progressText: style('[data-scene-id="progress"] [data-part="value"]').color,
                    tag: style('[data-scene-id="tag"]').backgroundColor,
                    tagText: style('[data-scene-id="tag"]').color,
                };
            });
            const rgb = (hex: string) => `rgb(${hex.slice(1).match(/../g)!.map(channel => parseInt(channel, 16)).join(', ')})`;
            expect(colors.legacyPrimary).toBe(colors.primary);
            expect(colors.legacyText).toBe(colors.text);
            expect(colors.button).toBe(rgb(colors.primary));
            expect(colors.buttonText).toBe(rgb(colors.contrast));
            expect(colors.cardBackground).toBe(rgb(colors.card));
            expect(colors.prose).toBe(rgb(colors.text));
            expect(colors.progress).toBe(rgb(colors.primary));
            expect(colors.progressText).toBe(rgb(colors.contrast));
            expect(colors.tag).toBe(rgb(colors.primary));
            expect(colors.tagText).toBe(rgb(colors.contrast));
            const axePath = execFileSync('node', ['-p', 'require.resolve("axe-core/axe.min.js")'], { cwd: workspace, encoding: 'utf8' }).trim();
            await page.addScriptTag({ path: axePath });
            const failures = await page.evaluate(async () => {
                const axe = Reflect.get(window, 'axe');
                const result = await axe.run(document.body, { runOnly: ['color-contrast'] });
                return result.violations;
            });
            expect(failures).toEqual([]);
            expect(errors).toEqual([]);
        } finally {
            await browser.close();
        }
    });
});

const application = `
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import Lara from '@primeuix/themes/lara';
import { PrimeReactProvider } from '@primereact/core';
import { styles as buttonStyles } from '@primereact/styles/button';
import { styles as cardStyles } from '@primereact/styles/card';
import { styles as tagStyles } from '@primereact/styles/tag';
import { styles as progressBarStyles } from '@primereact/styles/progressbar';
import { PrimeCard } from './panel/PrimeCard';
import { SceneThemeProvider } from '@cratis/scene.react';
import { LayoutConfigProvider } from '../blueprint.default/configuration';
import { AppShell } from '../blueprint.default/shell/AppShell';
import { Topbar } from '../blueprint.default/shell/Topbar';
import { lightTheme } from '../blueprint.default/themes/light';
import { darkTheme } from '../blueprint.default/themes/dark';
import { PrimeButton } from './button/PrimeButton';
import { PrimeText } from './screen/PrimeText';
import { PrimeTag } from './misc/PrimeTag';
import { PrimeProgressBar } from './misc/PrimeProgressBar';
import '../blueprint.default/shell/layout.css';
import '../components/theme/sceneTokenBridge.css';
import './primeReactTheme.css';
const props = (id, properties = {}) => ({ element: { id, properties }, slots: {} });
function App() {
    const [theme, setTheme] = useState(lightTheme);
    // PrimeReact 11.2 separates component styles from the token preset.
    return <PrimeReactProvider
        defaults={{
            Button: { props: { styles: buttonStyles } },
            'Card.Root': { props: { styles: cardStyles } },
            Tag: { props: { styles: tagStyles } },
            'ProgressBar.Root': { props: { styles: progressBarStyles } },
        }}
        theme={{ preset: Lara, options: { darkModeSelector: "[data-scene-color-scheme='dark']" } }}>
        <SceneThemeProvider theme={theme}>
            <LayoutConfigProvider storage={null}>
                <AppShell {...props('shell')} slots={{
                    topbar: [<Topbar {...props('topbar')} />],
                    content: [<PrimeCard {...props('card')} slots={{ content: [
                        <PrimeText {...props('prose', { text: 'The same palette in either library.' })} />,
                        <PrimeButton {...props('action', { label: 'Save changes' })} />,
                        <PrimeTag {...props('tag', { value: 'Published' })} />,
                        <PrimeProgressBar {...props('progress', { value: 65, label: 'Import progress' })} />
                    ] }} />]
                }} />
            </LayoutConfigProvider>
            <button data-test-theme='light' onClick={() => setTheme(lightTheme)}>Light</button>
            <button data-test-theme='dark' onClick={() => setTheme(darkTheme)}>Dark</button>
        </SceneThemeProvider>
    </PrimeReactProvider>;
}
flushSync(() => createRoot(document.getElementById('root')).render(<App />));
`;
