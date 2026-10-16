// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import axe from 'axe-core';
import { build } from 'esbuild';
import { Browser, BrowserContext, Page, chromium } from 'playwright-core';

const packageRoot = resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);

/** The entry the page runs: `showScreen(screen, pack, theme)` boots the Orders application on a screen, `showDialog` boots it with a dialog open over it. */
const entry = `
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { useEffect } from 'react';
import { PrimeReactProvider } from '@primereact/core';
import { DestinationKind } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { corePackage, mergePackageRegistries, useSceneNavigation } from '@cratis/scene.react';
import { ApplicationHost, LayoutConfigProvider, LayoutThemeProvider, createPreviewSampleData, defaultBlueprint, defaultBlueprintThemes } from '@cratis/scene.blueprint.default';
import { ordersApplication, ordersComposition, ordersNavigation, ordersStructure } from './index';

const registry = mergePackageRegistries([corePackage, defaultBlueprint]);
let root;

function OpenDialog({ name }) {
    const navigation = useSceneNavigation();
    useEffect(() => { if (name) navigation.navigate({ kind: DestinationKind.Dialog, dialog: name }); }, []);
    return null;
}

function show(screen, pack, packs, theme, dialog) {
    root ??= createRoot(document.getElementById('root'));
    const application = ordersApplication(pack);
    const samples = createPreviewSampleData(application, { packs, blueprintDefaultPack: pack });
    const scheme = theme === 'dark' ? 'dark' : 'light';
    // A new application every time: the host keeps where the user is, so reusing it would audit the first screen over and over.
    flushSync(() => root.render(
        <PrimeReactProvider key={[screen, pack, scheme, dialog].join('|')}>
            <ApplicationHost application={application} composition={ordersComposition} navigationModel={{ structure: new ApplicationStructureIndex(ordersStructure), navigation: ordersNavigation }} registry={registry}
                initialScreen={screen} resolveBinding={samples.resolveBinding} queryResults={samples.queryResults}
                scope={(_, children) => <LayoutConfigProvider initialConfig={{ colorScheme: scheme, themeName: scheme === 'dark' ? 'Scene Default Dark' : 'Scene Default Light' }} storage={null}><LayoutThemeProvider themes={defaultBlueprintThemes}>{children}</LayoutThemeProvider></LayoutConfigProvider>}>
                <OpenDialog name={dialog} />
            </ApplicationHost>
        </PrimeReactProvider>));
}
window.showScreen = (screen, pack, packs, theme) => show(screen, pack, packs, theme);
window.showDialog = (screen, dialog, pack, packs, theme) => show(screen, pack, packs, theme, dialog);
`;

let script: Promise<string> | undefined;

/** Bundles the blueprint's sources once, as a host application's bundler would. */
function bundled(): Promise<string> {
    script ??= build({
        stdin: { contents: entry, resolveDir: packageRoot, loader: 'tsx', sourcefile: 'orders-entry.tsx' },
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

/** A real headless Chromium page with the Orders application and the shell stylesheet loaded, for the checks jsdom cannot make: contrast, overflow and layout. */
export interface OrdersPage {
    browser: Browser;
    context: BrowserContext;
    page: Page;

    /** The uncaught errors the page raised. */
    errors: string[];

    /** Boots the application on a screen with a pack active, and audits it with axe-core, colour contrast included, and for horizontal overflow. */
    auditScreen(screen: string, pack: unknown, packs: unknown[], theme: 'light' | 'dark'): Promise<string[]>;

    /** Boots the application with a dialog open over a screen and audits it the same way, and that the dialog box stays inside the window. */
    auditDialog(screen: string, dialog: string, pack: unknown, packs: unknown[], theme: 'light' | 'dark'): Promise<string[]>;
}

/** Launches Chromium. It fails loudly when Chromium is not installed: a skipped browser specification proves nothing. */
export async function openOrdersPage(): Promise<OrdersPage> {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: viewports.desktop });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setContent('<!doctype html><html lang="en"><body style="margin:0"><div id="root"></div></body></html>');
    await page.addStyleTag({ content: readFileSync(require.resolve('@cratis/scene.blueprint.default/styles.css'), 'utf8') });
    await page.addScriptTag({ content: await bundled() });
    await page.addScriptTag({ content: axe.source });

    const audit = (call: string, argumentsList: unknown[], settle: number, checkDialog: boolean) =>
        page.evaluate(async ([name, args, wait, dialog]) => {
            const expected = (args as unknown[])[0] as string;
            const window_ = window as unknown as Record<string, (...arguments_: unknown[]) => void> & { axe: typeof axe };
            window_[name as string](...(args as unknown[]));
            await new Promise(resolve => setTimeout(resolve, wait as number));
            const result = await window_.axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, rules: { region: { enabled: false } } });
            const overflow = document.documentElement.scrollWidth > window.innerWidth ? [`overflow: the page is ${document.documentElement.scrollWidth}px wide in a ${window.innerWidth}px viewport`] : [];
            const box = dialog ? document.querySelector<HTMLElement>('[role="dialog"]')?.getBoundingClientRect() : undefined;
            const outside = !dialog ? [] : !box ? ['the dialog was not drawn'] : box.left < -1 || box.top < -1 || box.right > window.innerWidth + 1 ? [`the dialog box is outside the ${window.innerWidth}px window`] : [];
            const shown = document.querySelector('[data-scene-outlet="primary"]')?.getAttribute('data-scene-screen');
            const wrong = shown === expected ? [] : [`the page shows '${shown}', not the requested '${expected}'`];
            return [...wrong, ...overflow, ...outside, ...result.violations.map(violation => `${violation.id}: ${violation.nodes.map(node => node.target.join(' ')).join(', ')}`)];
        }, [call, argumentsList, settle, checkDialog] as const);

    return {
        browser, context, page, errors,
        auditScreen: (screen, pack, packs, theme) => audit('showScreen', [screen, (pack as { id: string }).id, packs, theme], 300, false),
        auditDialog: (screen, dialog, pack, packs, theme) => audit('showDialog', [screen, dialog, (pack as { id: string }).id, packs, theme], 300, true),
    };
}
