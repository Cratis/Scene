// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Page } from 'playwright-core';
import { ChromiumPage, openChromiumPage } from '../for_primeReactPackage/given/a_chromium_page';
import { PageWindow, ShowOptions } from '../for_primeReactPackage/given/page_window';
import { columns, documents } from './given/a_tree_table';

const checkboxes = { items: documents.map(node => ({ ...node, expanded: true, children: node.children?.map(child => ({ ...child, expanded: true })) })), columns, selectionMode: 'checkbox', ariaLabel: 'Files' };

describe('when operating a tree table in Chromium', () => {
    let chromium: ChromiumPage;
    let page: Page;

    const show = (properties: Record<string, unknown>, options: ShowOptions = {}) =>
        page.evaluate(([authored, host]) => (window as unknown as PageWindow).show('treeTable', authored, undefined, host as ShowOptions), [properties, options] as const);
    const focused = () => page.evaluate(() => document.activeElement?.querySelector('td')?.textContent?.replace(/^(Expand|Collapse)/, '') ?? document.activeElement?.tagName);
    const state = (name: string) => page.getByRole('checkbox', { name: `Select ${name}` }).evaluate(box => (box as HTMLInputElement).indeterminate ? 'partial' : (box as HTMLInputElement).checked ? 'checked' : 'unchecked');

    beforeAll(async () => { chromium = await openChromiumPage(); page = chromium.page; });
    afterAll(async () => { await chromium.browser.close(); });
    afterEach(async () => {
        await page.evaluate(() => (window as unknown as PageWindow).hide());
        chromium.errors.should.deep.equal([]);
    });

    it('should be reachable with Tab as one stop, and move through the rows with the arrow keys', async () => {
        await show({ items: documents, columns, ariaLabel: 'Files' });
        await page.keyboard.press('Tab');
        (await focused())!.should.equal('Documents');
        await page.keyboard.press('ArrowDown');
        (await focused())!.should.equal('Work');
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowRight');
        (await focused())!.should.equal('Plan');
        await page.keyboard.press('ArrowLeft');
        await page.keyboard.press('ArrowLeft');
        (await page.getByRole('row', { name: /Plan/ }).count()).should.equal(0);
        await page.keyboard.press('End');
        (await focused())!.should.equal('Music');
        await page.keyboard.press('Tab');
        (await page.evaluate(() => document.activeElement === document.body || !document.querySelector('[role=treegrid]')!.contains(document.activeElement))).should.equal(true);
    });

    it('should expose a tree grid with levels, positions and expanded state to assistive technology', async () => {
        await show({ items: documents, columns, ariaLabel: 'Files' });
        await page.getByRole('treegrid', { name: 'Files' }).waitFor();
        (await page.getByRole('columnheader').allTextContents()).should.deep.equal(['Name', 'Kind']);
        const work = page.getByRole('row', { name: /Work/ });
        (await work.getAttribute('aria-level'))!.should.equal('2');
        (await work.getAttribute('aria-expanded'))!.should.equal('false');
        await page.getByRole('button', { name: 'Expand Work' }).click();
        (await work.getAttribute('aria-expanded'))!.should.equal('true');
        (await page.getByRole('row', { name: /Plan/ }).getAttribute('aria-level'))!.should.equal('3');
    });

    it('should cascade a checked parent, show a partial parent, and uncheck a whole subtree, with the mouse', async () => {
        await show(checkboxes);
        await page.getByRole('checkbox', { name: 'Select Photos' }).check();
        (await state('Documents')).should.equal('partial');
        await page.getByRole('checkbox', { name: 'Select Documents' }).check();
        (await Promise.all(['Documents', 'Work', 'Plan', 'Photos'].map(state))).should.deep.equal(['checked', 'checked', 'checked', 'checked']);
        await page.getByRole('checkbox', { name: 'Select Plan' }).uncheck();
        (await Promise.all(['Documents', 'Work', 'Plan', 'Photos'].map(state))).should.deep.equal(['partial', 'unchecked', 'unchecked', 'checked']);
        await page.getByRole('checkbox', { name: 'Select Photos' }).uncheck();
        (await state('Documents')).should.equal('unchecked');
        (await page.evaluate(() => (window as unknown as PageWindow).events)).should.deep.equal(Array(4).fill(['select', 'change']).flat());
    });

    it('should select a row anywhere on it in single mode and with Space on the keyboard', async () => {
        await show({ items: documents, columns, selectionMode: 'single' });
        await page.getByRole('row', { name: /Music/ }).locator('td').nth(1).click();
        (await page.getByRole('row', { name: /Music/ }).getAttribute('aria-selected'))!.should.equal('true');
        await page.getByRole('row', { name: /Photos/ }).focus();
        await page.keyboard.press('Space');
        (await page.getByRole('row', { name: /Photos/ }).getAttribute('aria-selected'))!.should.equal('true');
        (await page.getByRole('row', { name: /Music/ }).getAttribute('aria-selected'))!.should.equal('false');
    });

    it('should follow a changed selection and keep the user\'s choice through unrelated edits', async () => {
        await show({ items: documents, columns, selectionMode: 'multiple', selection: ['music'] });
        await page.getByRole('row', { name: /Photos/ }).click();
        await show({ items: documents, columns, selectionMode: 'multiple', selection: ['music'], ariaLabel: 'Renamed' });
        (await page.locator('tr[aria-selected=true]').count()).should.equal(2);
        await show({ items: documents, columns, selectionMode: 'multiple', selection: ['plan'], ariaLabel: 'Renamed' });
        await page.getByRole('button', { name: 'Expand Work' }).click();
        (await page.locator('tr[aria-selected=true]').allTextContents()).should.deep.equal(['PlanFile']);
    });

    it('should show object cells readably and an empty table with a message', async () => {
        await show({ columns: [{ field: 'owner', header: 'Owner' }], items: [{ key: 'a', data: { owner: { name: 'Ada', team: { id: 7 } } } }] });
        (await page.locator('tbody td').innerText()).should.equal('name: Ada; team: id: 7');
        await show({ columns: [], items: [], selectionMode: 0 });
        (await page.locator('tbody').innerText()).should.equal('No records found');
    });

    it('should be styled by the theme: collapsed borders, a highlighted selection and a visible focus ring', async () => {
        await show({ items: documents, columns, selectionMode: 'single', selection: ['music'] });
        await page.keyboard.press('Tab');
        const style = await page.evaluate(() => {
            const table = getComputedStyle(document.querySelector('table')!);
            const selected = getComputedStyle(document.querySelector('tr[aria-selected=true]')!);
            const focused = getComputedStyle(document.activeElement!);
            return { collapse: table.borderCollapse, selected: selected.backgroundColor, focus: focused.outlineStyle };
        });
        style.collapse.should.equal('collapse');
        style.selected.should.not.equal('rgba(0, 0, 0, 0)');
        style.focus.should.equal('solid');
    });

    it('should operate nothing when disabled', async () => {
        await show({ ...checkboxes }, { isEnabled: false });
        for (const control of [...await page.getByRole('checkbox').all(), ...await page.getByRole('button').all()]) (await control.isDisabled()).should.equal(true);
    });
});
