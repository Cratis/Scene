// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Page } from 'playwright-core';
import { ChromiumPage, openChromiumPage } from '../for_primeReactPackage/given/a_chromium_page';

const red = '#ff0000';
const blue = '#0000ff';

interface Painted {
    red: number;
    blue: number;
    painted: number;
    total: number;
    cornerAlpha: number;
    centerAlpha: number;
    canvasWidth: number;
    canvasHeight: number;
}

/** Shows a chart in the page and waits for Chart.js to paint, then counts the pixels it really painted. */
async function paint(page: Page, properties: Record<string, unknown>, size = { width: 300, height: 200 }, fresh = true): Promise<Painted> {
    if (fresh) await page.evaluate(() => (window as unknown as { hide(): void }).hide());
    await page.evaluate(([chartProperties, chartSize]) => (window as unknown as { show(c: string, p: unknown, s: unknown): void }).show('chart', chartProperties, chartSize), [properties, size] as const);
    await page.waitForFunction(() => {
        const canvas = document.querySelector('canvas');
        if (canvas === null) return false;
        const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
        return pixels.some((value, index) => index % 4 === 3 && value > 0);
    }, undefined, { timeout: 10000 });

    return page.evaluate(() => {
        const canvas = document.querySelector('canvas')!;
        const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
        const count = { red: 0, blue: 0, painted: 0 };
        for (let index = 0; index < pixels.length; index += 4) {
            const [r, g, b, a] = [pixels[index], pixels[index + 1], pixels[index + 2], pixels[index + 3]];
            if (a < 250) continue;
            if (r > 200 && g < 60 && b < 60) count.red++;
            if (b > 200 && r < 60 && g < 60) count.blue++;
            if (a > 0) count.painted++;
        }

        const bounds = canvas.getBoundingClientRect();
        const center = ((Math.floor(canvas.height / 2) * canvas.width) + Math.floor(canvas.width / 2)) * 4;
        return { ...count, total: canvas.width * canvas.height, cornerAlpha: pixels[3], centerAlpha: pixels[center + 3], canvasWidth: Math.round(bounds.width), canvasHeight: Math.round(bounds.height) };
    });
}

describe('when painting a chart in Chromium', () => {
    let chromium: ChromiumPage;

    beforeAll(async () => { chromium = await openChromiumPage(); });
    afterAll(async () => { await chromium.browser.close(); });
    afterEach(async () => {
        await chromium.page.evaluate(() => (window as unknown as { hide(): void }).hide());
        chromium.errors.should.deep.equal([]);
    });

    it('should paint a migrated numeric bar chart with the colors of its data, filling its authored size', async () => {
        const painted = await paint(chromium.page, {
            type: 0, data: { labels: ['A'], datasets: [{ data: [10], backgroundColor: red }] }, options: { animation: false, scales: { y: { min: 0, max: 10 } } },
        });
        [painted.red > painted.total * 0.05, painted.blue, painted.canvasWidth, painted.canvasHeight].should.deep.equal([true, 0, 300, 200]);
    });

    it('should fill the authored size when the chart is shorter than its default aspect ratio', async () => {
        const painted = await paint(chromium.page, { type: 0, data: { labels: ['A'], datasets: [{ data: [1], backgroundColor: red }] }, options: { animation: false } }, { width: 220, height: 72 });
        [painted.canvasWidth, painted.canvasHeight].should.deep.equal([220, 72]);
    });

    it('should paint pie slices in proportion to the data', async () => {
        const painted = await paint(chromium.page, {
            type: 2, options: { animation: false, plugins: { legend: { display: false } } },
            data: { labels: ['One', 'Three'], datasets: [{ data: [25, 75], backgroundColor: [red, blue], borderWidth: 0 }] },
        });
        const ratio = painted.blue / painted.red;
        [ratio > 2.85 && ratio < 3.15, painted.cornerAlpha, painted.painted < painted.total * 0.7].should.deep.equal([true, 0, true]);
    });

    it('should paint the center of a pie (ordinal 2) and leave the hole of a doughnut (ordinal 3) empty', async () => {
        const data = { labels: ['A', 'B'], datasets: [{ data: [3, 5], backgroundColor: [red, blue] }] };
        const pie = await paint(chromium.page, { type: 2, data, options: { animation: false } });
        const doughnut = await paint(chromium.page, { type: 3, data, options: { animation: false } });
        [pie.centerAlpha, doughnut.centerAlpha].should.deep.equal([255, 0]);
    });

    it('should draw a line (ordinal 1) as a stroke and a bar (ordinal 0) as a filled area', async () => {
        const series = { labels: ['A', 'B'], datasets: [{ data: [5, 5], backgroundColor: red, borderColor: red }] };
        const bar = await paint(chromium.page, { type: 0, data: series, options: { animation: false, scales: { y: { min: 0, max: 5 } } } });
        const line = await paint(chromium.page, { type: 1, data: series, options: { animation: false, scales: { y: { min: 0, max: 5 } } } });
        (bar.red > line.red * 5).should.be.true;
    });

    it('should size a bubble (ordinal 6) by its radius and a scatter point (ordinal 7) by its point radius', async () => {
        const bubble = await paint(chromium.page, { type: 6, data: { datasets: [{ data: [{ x: 1, y: 1, r: 30 }], backgroundColor: red }] }, options: { animation: false } });
        const scatter = await paint(chromium.page, { type: 7, data: { datasets: [{ data: [{ x: 1, y: 1 }], backgroundColor: red, pointRadius: 5 }] }, options: { animation: false } });
        (bubble.red > scatter.red * 3).should.be.true;
    });

    const dataByType: [number, string, unknown][] = [
        [0, 'bar', { labels: ['A', 'B'], datasets: [{ data: [3, 5], backgroundColor: red }] }],
        [1, 'line', { labels: ['A', 'B'], datasets: [{ data: [3, 5], borderColor: red, borderWidth: 6 }] }],
        [2, 'pie', { labels: ['A', 'B'], datasets: [{ data: [3, 5], backgroundColor: [red, blue] }] }],
        [3, 'doughnut', { labels: ['A', 'B'], datasets: [{ data: [3, 5], backgroundColor: [red, blue] }] }],
        [4, 'polar area', { labels: ['A', 'B'], datasets: [{ data: [3, 5], backgroundColor: [red, blue] }] }],
        [5, 'radar', { labels: ['A', 'B', 'C'], datasets: [{ data: [3, 5, 4], backgroundColor: red, borderColor: red }] }],
        [6, 'bubble', { datasets: [{ data: [{ x: 1, y: 2, r: 20 }], backgroundColor: red }] }],
        [7, 'scatter', { datasets: [{ data: [{ x: 1, y: 2 }], backgroundColor: red, pointRadius: 12 }] }],
    ];

    for (const [ordinal, name, data] of dataByType) {
        it(`should paint the red of a legacy ordinal ${ordinal} (${name}) chart from its own data`, async () => {
            const painted = await paint(chromium.page, { type: ordinal, data, options: { animation: false } });
            (painted.red > 100).should.be.true;
        });
    }

    it('should paint a different picture for each of the eight ordinals, not one default chart', async () => {
        const signatures = new Set<string>();
        for (const [ordinal, , data] of dataByType) {
            const painted = await paint(chromium.page, { type: ordinal, data, options: { animation: false, plugins: { legend: { display: false } } } });
            signatures.add(`${painted.red}:${painted.blue}:${painted.painted}`);
        }

        signatures.size.should.equal(8);
    });

    it('should show an explicit empty state instead of a blank canvas for a migrated chart without data', async () => {
        await chromium.page.evaluate(() => (window as unknown as { show(c: string, p: unknown, s: unknown): void }).show('chart', { type: 0 }, { width: 220, height: 72 }));
        const state = await chromium.page.evaluate(() => {
            const status = document.querySelector('[role="status"]')!;
            const bounds = status.getBoundingClientRect();
            return { text: status.textContent, visible: bounds.width > 0 && bounds.height > 0, canvases: document.querySelectorAll('canvas').length };
        });
        state.should.deep.equal({ text: 'No chart data', visible: true, canvases: 0 });
    });

    it('should report a chart type it does not know instead of painting a bar chart', async () => {
        await chromium.page.evaluate(() => (window as unknown as { show(c: string, p: unknown, s: unknown): void }).show('chart', { type: 'PolarArea ', data: { datasets: [{ data: [1] }] } }, {}));
        const state = await chromium.page.evaluate(() => ({ alert: document.querySelector('[role="alert"]')?.textContent, canvases: document.querySelectorAll('canvas').length }));
        [state.alert!.startsWith("Unsupported chart type 'PolarArea '"), state.canvases].should.deep.equal([true, 0]);
    });

    describe('and the options are invalid and then corrected', () => {
        const data = { labels: ['A'], datasets: [{ data: [10], backgroundColor: red }] };
        const valid = { type: 0, data, options: { animation: false, scales: { y: { min: 0, max: 10 } } } };
        const invalid = { type: 0, data, options: { animation: false, scales: { x: { type: 'nonexistentScale' } } } };
        const show = (properties: unknown) => chromium.page.evaluate(([chartProperties]) => (window as unknown as { show(c: string, p: unknown, s: unknown): void }).show('chart', chartProperties, { width: 300, height: 200 }), [properties] as const);
        const state = () => chromium.page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            const pixels = canvas === null || canvas.hidden ? [] : canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
            let painted = 0;
            for (let index = 3; index < pixels.length; index += 4) if (pixels[index] > 0) painted++;
            return { alerts: [...document.querySelectorAll('[role="alert"]')].map(alert => alert.textContent ?? ''), hidden: canvas?.hidden, painted };
        });

        it('should report the real reason, then paint and report nothing once the options are valid', async () => {
            await chromium.page.evaluate(() => (window as unknown as { hide(): void }).hide());
            await show(invalid);
            await chromium.page.waitForSelector('[role="alert"]', { timeout: 10000 });
            const failed = await state();
            [failed.alerts.length, failed.alerts[0].includes('nonexistentScale'), failed.alerts[0].includes('already in use'), failed.hidden, failed.painted].should.deep.equal([1, true, false, true, 0]);

            const repaired = await paint(chromium.page, valid, { width: 300, height: 200 }, false);
            const after = await state();
            [repaired.red > repaired.total * 0.05, after.alerts, after.hidden].should.deep.equal([true, [], false]);
        });

        it('should keep reporting the real reason, not a leftover canvas, while the options stay invalid', async () => {
            await chromium.page.evaluate(() => (window as unknown as { hide(): void }).hide());
            await show(invalid);
            await chromium.page.waitForSelector('[role="alert"]', { timeout: 10000 });
            await show({ ...invalid, data: { labels: ['A'], datasets: [{ data: [11], backgroundColor: red }] } });
            await new Promise(resolve => setTimeout(resolve, 200));
            const failed = await state();
            [failed.alerts.length, failed.alerts[0].includes('nonexistentScale')].should.deep.equal([1, true]);
        });

        it('should paint after a corrected chart type as well', async () => {
            await chromium.page.evaluate(() => (window as unknown as { hide(): void }).hide());
            await show(invalid);
            await chromium.page.waitForSelector('[role="alert"]', { timeout: 10000 });
            const repaired = await paint(chromium.page, { ...valid, type: 'bar' }, { width: 300, height: 200 }, false);
            (await state()).alerts.should.deep.equal([]);
            (repaired.red > 100).should.be.true;
        });
    });

    it('should paint new data when the document edits it', async () => {
        await paint(chromium.page, { type: 0, data: { labels: ['A'], datasets: [{ data: [10], backgroundColor: red }] }, options: { animation: false } });
        const painted = await paint(chromium.page, { type: 0, data: { labels: ['A'], datasets: [{ data: [10], backgroundColor: blue }] }, options: { animation: false } }, { width: 300, height: 200 }, false);
        await chromium.page.waitForFunction(() => {
            const canvas = document.querySelector('canvas')!;
            const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
            for (let index = 0; index < pixels.length; index += 4) if (pixels[index + 2] > 200 && pixels[index] < 60 && pixels[index + 3] > 250) return true;
            return false;
        }, undefined, { timeout: 10000 });
        painted.canvasWidth.should.equal(300);
    });
});
