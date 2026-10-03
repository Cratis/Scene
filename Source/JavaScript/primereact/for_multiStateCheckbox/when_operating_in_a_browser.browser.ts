// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Locator } from 'playwright-core';
import { ChromiumPage, openChromiumPage } from '../for_primeReactPackage/given/a_chromium_page';

type Window = { show(component: string, properties: unknown, size?: unknown): void; hide(): void };

const review = {
    value: null,
    options: [{ label: 'Approved', value: 'approved' }, { label: 'Rejected', value: 'rejected' }],
    ariaLabel: 'Review status',
};

describe('when operating a multi-state checkbox in Chromium', () => {
    let chromium: ChromiumPage;
    let control: Locator;

    beforeAll(async () => { chromium = await openChromiumPage(); });
    afterAll(async () => { await chromium.browser.close(); });

    async function show(properties: Record<string, unknown>): Promise<Locator> {
        await chromium.page.evaluate(([component, authored]) => (window as unknown as Window).show(component as string, authored), ['multiStateCheckbox', properties] as const);
        control = chromium.page.getByRole('button', { name: String(properties.ariaLabel ?? 'Subject') });
        return control;
    }

    const state = () => control.locator('span[aria-hidden="true"]:not([data-scene-part])').textContent();

    afterEach(async () => {
        await chromium.page.evaluate(() => (window as unknown as Window).hide());
        chromium.errors.should.deep.equal([]);
    });

    it('should advance one state for each Enter and each Space on the focused control', async () => {
        await show(review);
        await control.focus();
        const seen = [await state()];
        await chromium.page.keyboard.press('Enter');
        seen.push(await state());
        await chromium.page.keyboard.press('Space');
        seen.push(await state());
        await chromium.page.keyboard.press('Enter');
        seen.push(await state());
        seen.should.deep.equal(['No selection', 'Approved', 'Rejected', 'No selection']);
    });

    it('should reach an option after a null option while the empty state is allowed', async () => {
        await show({ ...review, options: [{ label: 'Approved', value: 'approved' }, { label: 'Nothing', value: null }, { label: 'Rejected', value: 'rejected' }] });
        const seen = [await state()];
        for (let click = 0; click < 4; click++) {
            await control.click();
            seen.push(await state());
        }

        seen.should.deep.equal(['Nothing', 'Rejected', 'Approved', 'Nothing', 'Rejected']);
    });

    it('should reach every option when two of them share a value', async () => {
        await show({ ...review, empty: false, value: 'same', options: [{ label: 'First', value: 'same' }, { label: 'Second', value: 'same' }, { label: 'Third', value: 'x' }] });
        const seen = [await state()];
        for (let click = 0; click < 3; click++) {
            await control.click();
            seen.push(await state());
        }

        seen.should.deep.equal(['First', 'Second', 'Third', 'First']);
    });

    it('should show a value the document sets after the control is already on screen', async () => {
        await show(review);
        await show({ ...review, value: 'rejected' });
        (await state())!.should.equal('Rejected');
    });

    it('should expose a named button whose state is a description, never a checked state', async () => {
        await show(review);
        await control.click();
        const snapshot = await chromium.page.locator('body').ariaSnapshot();
        const description = await chromium.page.evaluate(() => {
            const button = document.querySelector('button')!;
            return document.getElementById(button.getAttribute('aria-describedby')!)!.textContent;
        });
        [snapshot.includes('button "Review status"'), /checkbox|checked|pressed/.test(snapshot), description].should.deep.equal([true, false, 'Approved']);
    });

    it('should keep a read only control focusable and unchanged', async () => {
        await show({ ...review, readOnly: true });
        await control.focus();
        await chromium.page.keyboard.press('Enter');
        await control.click({ force: true });
        const focused = await chromium.page.evaluate(() => document.activeElement === document.querySelector('button'));
        [await state(), focused].should.deep.equal(['No selection', true]);
    });

    it('should keep a disabled control out of the tab order and unchanged', async () => {
        await show({ ...review, disabled: true });
        await chromium.page.keyboard.press('Tab');
        const focused = await chromium.page.evaluate(() => document.activeElement === document.querySelector('button'));
        await control.click({ force: true });
        [await state(), focused].should.deep.equal(['No selection', false]);
    });

    describe('and drawing the glyph', () => {
        const glyphStyle = () => control.locator('[data-scene-part="glyph"]').evaluate(glyph => {
            const style = getComputedStyle(glyph);
            return { width: style.width, height: style.height, radius: style.borderTopLeftRadius, background: style.backgroundColor, color: style.color };
        });

        it('should follow the PrimeReact checkbox tokens the active theme sets', async () => {
            await chromium.page.evaluate(() => document.documentElement.style.setProperty('--p-checkbox-width', '30px'));
            await chromium.page.evaluate(() => document.documentElement.style.setProperty('--p-checkbox-border-radius', '9px'));
            await chromium.page.evaluate(() => document.documentElement.style.setProperty('--p-checkbox-checked-background', 'rgb(0, 128, 0)'));
            await show(review);
            const empty = await glyphStyle();
            await control.click();
            const approved = await glyphStyle();
            await chromium.page.evaluate(() => ['--p-checkbox-width', '--p-checkbox-border-radius', '--p-checkbox-checked-background'].forEach(token => document.documentElement.style.removeProperty(token)));
            [empty.width, empty.radius, approved.background].should.deep.equal(['30px', '9px', 'rgb(0, 128, 0)']);
        });

        it('should look like a checkbox box with the default size when no theme is active', async () => {
            await show(review);
            const style = await glyphStyle();
            [style.width, style.height, style.radius].should.deep.equal(['18px', '18px', '4px']);
        });

        it('should paint a check mark in a chosen state, and nothing in the empty one', async () => {
            await show(review);
            const painted = () => control.locator('[data-scene-part="glyph"]').evaluate(glyph => glyph.querySelector('svg') !== null);
            const empty = await painted();
            await control.click();
            [empty, await painted()].should.deep.equal([false, true]);
        });
    });
});
