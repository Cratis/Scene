// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Page } from 'playwright-core';
import { ChromiumPage, openChromiumPage } from '../for_primeReactPackage/given/a_chromium_page';
import { PageWindow, ShowOptions } from '../for_primeReactPackage/given/page_window';

const items = (count: number) => Array.from({ length: count }, (_, index) => `row ${index}`);

describe('when scrolling in Chromium', () => {
    let chromium: ChromiumPage;
    let page: Page;

    const show = (properties: Record<string, unknown>, options: ShowOptions = {}) =>
        page.evaluate(([authored, host]) => (window as unknown as PageWindow).show('dataScroller', authored, undefined, host as ShowOptions), [properties, options] as const);
    const loaded = () => page.locator('li').count();

    beforeAll(async () => { chromium = await openChromiumPage(); page = chromium.page; });
    afterAll(async () => { await chromium.browser.close(); });
    afterEach(async () => {
        await page.evaluate(() => (window as unknown as PageWindow).hide());
        chromium.errors.should.deep.equal([]);
    });

    describe('and the scroller is inline', () => {
        it('should scroll inside its own box and load the next chunk at the end, until the list is exhausted', async () => {
            await show({ items: items(60), rows: 10, inline: true, scrollHeight: 200 });
            const region = page.getByRole('region');
            await region.waitFor();
            const box = await region.evaluate(element => ({ client: element.clientHeight, scroll: element.scrollHeight }));
            box.client.should.be.within(190, 205);
            box.scroll.should.be.greaterThan(box.client);

            let count = await loaded();
            count.should.equal(10);
            for (let step = 0; step < 12 && count < 60; step++) {
                await region.evaluate(element => { element.scrollTop = element.scrollHeight; });
                await page.waitForFunction(previous => document.querySelectorAll('li').length > previous, count, { timeout: 3000 });
                count = await loaded();
            }

            count.should.equal(60);
            (await page.getByRole('button', { name: 'Load more' }).count()).should.equal(0);
            (await page.evaluate(() => window.scrollY)).should.equal(0);
        });

        it('should load nothing by scrolling when disabled, though the user can still read what is there', async () => {
            await show({ items: items(60), rows: 10, inline: true, scrollHeight: 200 }, { isEnabled: false });
            const region = page.getByRole('region');
            await region.evaluate(element => { element.scrollTop = element.scrollHeight; });
            await page.waitForTimeout(400);
            (await loaded()).should.equal(10);
            (await page.getByRole('button', { name: 'Load more' }).isDisabled()).should.equal(true);
        });
    });

    describe('and the scroller is not inline', () => {
        it('should load as the page scrolls the end of the list into view', async () => {
            await show({ items: items(80), rows: 15, inline: false });
            await page.getByRole('region').waitFor();
            let count = await loaded();
            for (let step = 0; step < 10 && count < 80; step++) {
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await page.waitForFunction(previous => document.querySelectorAll('li').length > previous, count, { timeout: 3000 });
                count = await loaded();
            }

            count.should.equal(80);
        });

        it('should hold at the first chunk when the end is never scrolled into view', async () => {
            await show({ items: items(300), rows: 5, inline: false });
            await page.getByRole('region').waitFor();
            await page.waitForTimeout(400);
            (await loaded()).should.be.within(5, 60);
            (await page.getByRole('button', { name: 'Load more' }).count()).should.equal(1);
        });
    });

    describe('and the properties change', () => {
        it('should follow rows and a replaced list without reloading on an unrelated edit', async () => {
            await show({ items: items(60), rows: 5, inline: true, scrollHeight: 100 });
            await page.locator('li').first().waitFor();
            await page.getByRole('button', { name: 'Load more' }).click();
            (await loaded()).should.equal(10);

            await show({ items: items(60), rows: 5, inline: true, scrollHeight: 100, ariaLabel: 'Renamed' });
            (await loaded()).should.equal(10);

            await show({ items: items(60), rows: 25, inline: true, scrollHeight: 100, ariaLabel: 'Renamed' });
            (await loaded()).should.equal(25);

            await show({ items: items(7), rows: 25, inline: true, scrollHeight: 100 });
            (await loaded()).should.equal(7);
        });
    });

    describe('and the button loads more', () => {
        it('should move focus to the first new row and announce the count', async () => {
            await show({ items: items(25), rows: 10, inline: true, scrollHeight: 150 });
            const button = page.getByRole('button', { name: 'Load more' });
            await button.focus();
            await page.keyboard.press('Enter');
            (await page.evaluate(() => document.activeElement?.textContent))!.should.equal('row 10');
            (await page.getByText('Showing 20 of 25 items').count()).should.equal(1);
            await page.keyboard.press('Tab');
            (await page.evaluate(() => document.activeElement?.textContent))!.should.equal('Load more');
        });
    });

    describe('and the items are not plain text', () => {
        it('should show records and nested values readably, and refuse legacy elements', async () => {
            await show({ items: [{ title: 'Invoice', amount: 120, customer: { name: 'Ada' } }, { _derivedTypeId: 'PrimeReact.Label', text: 'Hello' }], rows: 10 });
            const text = await page.locator('ol').innerText();
            text.should.contain('Invoice');
            text.should.contain('name: Ada');
            text.should.not.contain('{');
            text.should.not.contain('Hello');
            (await page.getByRole('alert').textContent())!.should.contain('serialized legacy UI element');
        });

        it('should be styled by the theme rather than left as a bare list', async () => {
            await show({ items: ['One'], rows: 10 });
            const style = await page.evaluate(() => {
                const item = getComputedStyle(document.querySelector('li')!);
                return { bullet: item.listStyleType, border: item.borderBottomStyle, padding: parseFloat(item.paddingLeft) };
            });
            style.border.should.equal('solid');
            style.padding.should.be.greaterThan(4);
        });
    });
});
