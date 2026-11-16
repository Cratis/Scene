// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { build } from 'esbuild';
import { Browser, Page, chromium } from 'playwright-core';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const workspace = resolve(import.meta.dirname, '..');
const javascript = resolve(workspace, '..');
let browser: Browser;
let page: Page;
const errors: string[] = [];

const rgb = (hex: string) => `rgb(${hex.slice(1).match(/../g)!.map(channel => parseInt(channel, 16)).join(', ')})`;

// What a design system that declares every variant of the Button, and the severities of the Tag, the Badge and the Message, asks of PrimeReact.
// Every value is a distinct, recognisable colour so a computed style can only have come from the variant it is asserted against.
const application = `
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import Lara from '@primeuix/themes/lara';
import { PrimeReactProvider } from '@primereact/core';
import { styles as buttonStyles } from '@primereact/styles/button';
import { styles as tagStyles } from '@primereact/styles/tag';
import { styles as badgeStyles } from '@primereact/styles/badge';
import { styles as messageStyles } from '@primereact/styles/message';
import { SceneThemeProvider } from '@cratis/scene.react';
import { resolveDesign } from '@cratis/scene.engine';
import { PrimeButton } from './button/PrimeButton';
import { PrimeTag } from './misc/PrimeTag';
import { PrimeBadge } from './misc/PrimeBadge';
import { PrimeMessage } from './messages/PrimeMessage';
import './primeReactTheme.css';

const colors = {
    'color.canvas': '#fafafa', 'color.ink': '#101010', 'color.primary': '#112233', 'color.on-primary': '#fefefe',
    'color.secondary': '#445566', 'color.on-secondary': '#f0f0f0', 'color.danger': '#aa0000', 'color.danger-hover': '#880000', 'color.on-danger': '#ffffee',
    'color.accent': '#007700', 'color.link': '#0000cc',
    'color.success': '#116611', 'color.on-success': '#eeffee', 'color.fail': '#770000', 'color.fail-surface': '#ffe0e0', 'color.fail-edge': '#cc3333',
    'radius.small': '2px', 'radius.pill': '20px',
};
const roles = Object.keys(colors).map(key => ({ category: key.split('.')[0], name: key.split('.')[1] }));
const variant = (name, parts, states) => ({ name, parts, ...(states ? { states } : {}) });
const designSystem = {
    name: 'Every variant', modes: ['light'], tokens: roles,
    themes: [{ name: 'Day', isDefault: true, modes: [{ mode: 'light', tokens: colors }] }],
    components: [
        { name: 'Shell', parts: ['background', 'text'], variants: [variant('default', { background: 'color.canvas', text: 'color.ink' })] },
        { name: 'Text', parts: ['text'], variants: [variant('default', { text: 'color.ink' })] },
        {
            name: 'Button', parts: ['background', 'text', 'border', 'radius'],
            variants: [
                variant('primary', { background: 'color.primary', text: 'color.on-primary', radius: 'radius.small' }),
                variant('secondary', { background: 'color.secondary', text: 'color.on-secondary', radius: 'radius.pill' }),
                variant('danger', { background: 'color.danger', text: 'color.on-danger' }, { hover: { background: 'color.danger-hover' } }),
                variant('outlined', { text: 'color.accent', border: 'color.accent', background: 'color.canvas' }),
                variant('text', { text: 'color.accent' }),
                variant('link', { text: 'color.link' }),
            ],
        },
        { name: 'Tag', parts: ['background', 'text'], variants: [variant('success', { background: 'color.success', text: 'color.on-success' })] },
        { name: 'Badge', parts: ['background', 'text'], variants: [variant('success', { background: 'color.success', text: 'color.on-success' })] },
        { name: 'Message', parts: ['background', 'text', 'border'], variants: [variant('danger', { background: 'color.fail-surface', text: 'color.fail', border: 'color.fail-edge' })] },
    ],
};
const design = resolveDesign({ designSystem });
const props = (id, properties = {}) => ({ element: { id, properties }, slots: {}, interactions: {} });
const buttons = ['primary', 'secondary', 'danger', 'outlined', 'text', 'link', 'success'];

flushSync(() => createRoot(document.getElementById('root')).render(
    <PrimeReactProvider
        defaults={{ Button: { props: { styles: buttonStyles } }, Tag: { props: { styles: tagStyles } }, Badge: { props: { styles: badgeStyles } }, 'Message.Root': { props: { styles: messageStyles } } }}
        theme={{ preset: Lara }}>
        <div id='plain'>
            <PrimeButton {...props('plain-success', { label: 'Plain', severity: 'success' })} />
        </div>
        <SceneThemeProvider design={design}>
            {buttons.map(severity => <PrimeButton key={severity} {...props('button-' + severity, { label: severity, severity })} />)}
            <PrimeButton {...props('button-danger-outlined', { label: 'danger outlined', severity: 'danger', outlined: true })} />
            <PrimeTag {...props('tag-success', { value: 'Done', severity: 'success' })} />
            <PrimeBadge {...props('badge-success', { value: '3', severity: 'success' })} />
            <PrimeMessage {...props('message-danger', { text: 'Failed', severity: 'danger' })} />
            <PrimeMessage {...props('message-error', { text: 'Failed too', severity: 'error' })} />
        </SceneThemeProvider>
    </PrimeReactProvider>));
`;

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
    const script = bundle.outputFiles.find(file => file.path.endsWith('.js'))!.text;
    const css = bundle.outputFiles.find(file => file.path.endsWith('.css'))?.text ?? '';
    const executablePath = process.env.CHROMIUM_PATH ?? (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
    browser = await chromium.launch({ headless: true, executablePath, args: ['--no-sandbox'] });
    page = await browser.newPage({ colorScheme: 'light' });
    page.on('pageerror', error => errors.push(error.message));
    page.setDefaultTimeout(10000);
    await page.setContent('<!doctype html><html lang="en"><head><title>Variants</title></head><body><div id="root"></div></body></html>');
    await page.addStyleTag({ content: css });
    await page.addScriptTag({ content: script });
    await page.waitForSelector('[data-scene-id="button-primary"]');
}, 90000);

afterAll(async () => {
    await page?.close();
    await browser?.close();
});

const style = (id: string, property: 'backgroundColor' | 'color' | 'borderTopColor' | 'borderTopLeftRadius') =>
    page.evaluate(([selector, name]) => getComputedStyle(document.querySelector(selector)!)[name as 'color'], [`[data-scene-id="${id}"]`, property] as const);

describe('when PrimeReact renders every variant a design system declares', () => {
    it('should raise no error', () => expect(errors).toEqual([]));


    describe('and the Button is filled', () => {
        it('should paint the primary variant from its own parts', async () => {
            expect(await style('button-primary', 'backgroundColor')).toBe(rgb('#112233'));
            expect(await style('button-primary', 'color')).toBe(rgb('#fefefe'));
            expect(await style('button-primary', 'borderTopLeftRadius')).toBe('2px');
        });

        it('should paint the secondary variant from its own parts, not the preset\'s', async () => {
            expect(await style('button-secondary', 'backgroundColor')).toBe(rgb('#445566'));
            expect(await style('button-secondary', 'color')).toBe(rgb('#f0f0f0'));
            expect(await style('button-secondary', 'borderTopLeftRadius')).toBe('20px');
        });

        it('should paint the danger variant from its own parts', async () => {
            expect(await style('button-danger', 'backgroundColor')).toBe(rgb('#aa0000'));
            expect(await style('button-danger', 'color')).toBe(rgb('#ffffee'));
        });

        it('should paint the danger variant in the hover state the design system declares', async () => {
            await page.hover('[data-scene-id="button-danger"]');
            await page.waitForFunction(selector => getComputedStyle(document.querySelector(selector)!).backgroundColor === 'rgb(136, 0, 0)', '[data-scene-id="button-danger"]');
            expect(await style('button-danger', 'backgroundColor')).toBe(rgb('#880000'));
            await page.mouse.move(0, 0);
        });
    });

    describe('and the Button takes a form', () => {
        it('should paint the outlined variant from its own parts', async () => {
            expect(await style('button-outlined', 'color')).toBe(rgb('#007700'));
            expect(await style('button-outlined', 'borderTopColor')).toBe(rgb('#007700'));
            expect(await style('button-outlined', 'backgroundColor')).toBe(rgb('#fafafa'));
        });

        it('should paint the text variant from its own parts', async () => {
            expect(await style('button-text', 'color')).toBe(rgb('#007700'));
            expect(await style('button-text', 'backgroundColor')).toBe('rgba(0, 0, 0, 0)');
        });

        it('should paint the link variant from its own parts', async () => expect(await style('button-link', 'color')).toBe(rgb('#0000cc')));

        it('should tint a form chosen by flag with the severity it is combined with', async () => {
            expect(await style('button-danger-outlined', 'color')).toBe(rgb('#aa0000'));
        });
    });

    describe('and the design system declares no such variant', () => {
        it('should leave a Button severity to the preset, as it looks outside the design system', async () => {
            expect(await style('button-success', 'backgroundColor')).toBe(await style('plain-success', 'backgroundColor'));
            expect(await style('button-success', 'color')).toBe(await style('plain-success', 'color'));
        });
    });

    describe('and the other components of PrimeReact that have variants', () => {
        it('should paint a Tag severity from its design-system variant', async () => {
            expect(await style('tag-success', 'backgroundColor')).toBe(rgb('#116611'));
            expect(await style('tag-success', 'color')).toBe(rgb('#eeffee'));
        });

        it('should paint a Badge severity from its design-system variant', async () => {
            expect(await style('badge-success', 'backgroundColor')).toBe(rgb('#116611'));
            expect(await style('badge-success', 'color')).toBe(rgb('#eeffee'));
        });

        it('should paint a Message severity from its design-system variant, whether it is called danger or error', async () => {
            for (const id of ['message-danger', 'message-error']) {
                expect(await style(id, 'backgroundColor')).toBe(rgb('#ffe0e0'));
                expect(await style(id, 'color')).toBe(rgb('#770000'));
            }
            // Whether the border is drawn at all is the preset's choice (Lara's filled message has none); what it is painted with is the design system's.
            expect(await page.evaluate(() => getComputedStyle(document.querySelector('[data-scene-id="message-danger"]')!).getPropertyValue('--p-message-error-border-color'))).toBe('#cc3333');
        });
    });
});
