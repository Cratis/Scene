// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import axe from 'axe-core';
import { build } from 'esbuild';
import { Browser, BrowserContext, Page, chromium } from 'playwright-core';

const packageRoot = resolve(import.meta.dirname, '..', '..');

/** The entry the page runs: `show(component, theme, properties, rightToLeft)` renders every standard state of one foundation component. */
const entry = `
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { FoundationStates } from './foundation/FoundationStates';

let root;
window.show = (component, theme, properties, rightToLeft) => {
    root ??= createRoot(document.getElementById('root'));
    flushSync(() => root.render(<FoundationStates component={component} theme={theme} properties={properties} rightToLeft={rightToLeft} />));
};
`;

let script: Promise<string> | undefined;

/** Bundles the foundation sources once, as a host application's bundler would. */
function bundled(): Promise<string> {
    script ??= build({
        stdin: { contents: entry, resolveDir: packageRoot, loader: 'tsx', sourcefile: 'foundation-entry.tsx' },
        bundle: true,
        write: false,
        outdir: resolve(packageRoot, '.chromium-out'),
        format: 'iife',
        platform: 'browser',
        jsx: 'automatic',
        define: { 'process.env.NODE_ENV': '"production"' },
        logLevel: 'error',
    }).then(result => result.outputFiles.find(file => file.path.endsWith('.js'))!.text);
    return script;
}

/** The viewports spec Part B 6 names: desktop, tablet and phone. */
export const viewports = { desktop: { width: 1280, height: 800 }, tablet: { width: 768, height: 1024 }, phone: { width: 375, height: 667 } } as const;

/** A real headless Chromium page with the foundation components and the shell stylesheet loaded, for the checks jsdom cannot make: contrast, overflow and layout. */
export interface FoundationPage {
    browser: Browser;
    context: BrowserContext;
    page: Page;

    /** The uncaught errors the page raised. */
    errors: string[];

    /** Shows every state of a component and runs axe-core (with colour contrast) over the page; returns the violations as readable lines. */
    audit(component: string, theme: 'light' | 'dark', properties?: Record<string, unknown>, rightToLeft?: boolean, openDisclosures?: boolean): Promise<string[]>;
}

/** Launches Chromium. It fails loudly when Chromium is not installed: a skipped browser specification proves nothing. */
export async function openFoundationPage(): Promise<FoundationPage> {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: viewports.desktop });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setContent('<!doctype html><html lang="en"><body style="margin:0"><div id="root"></div></body></html>');
    await page.addStyleTag({ content: readFileSync(resolve(packageRoot, 'shell', 'layout.css'), 'utf8') });
    await page.addScriptTag({ content: await bundled() });
    await page.addScriptTag({ content: axe.source });

    const audit = (component: string, theme: 'light' | 'dark', properties?: Record<string, unknown>, rightToLeft?: boolean, openDisclosures = false) =>
        page.evaluate(async ([name, themeName, props, rtl, open]) => {
            const window_ = window as unknown as { show(...arguments_: unknown[]): void; axe: typeof axe };
            window_.show(name, themeName, props, rtl);
            if (open) document.querySelectorAll<HTMLElement>('button[aria-expanded="false"]').forEach(button => button.click());
            await new Promise(resolve => setTimeout(resolve, 0));
            const result = await window_.axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, rules: { region: { enabled: false } } });
            const overflow = document.documentElement.scrollWidth > window.innerWidth ? [`overflow: the page is ${document.documentElement.scrollWidth}px wide in a ${window.innerWidth}px viewport`] : [];
            return [...overflow, ...result.violations.map(violation => `${violation.id}: ${violation.nodes.map(node => node.target.join(' ')).join(', ')}`)];
        }, [component, theme, properties, rightToLeft, openDisclosures] as const);

    return { browser, context, page, errors, audit };
}
