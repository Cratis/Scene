// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Locator, Page } from 'playwright-core';
import { ShellPage, openShellPage } from './given/a_shell_page';

/** Focus is restored after the overlay's exit transition, so wait for it rather than sampling once. */
async function focusReturnsTo(page: Page, trigger: Locator) {
    const handle = await trigger.elementHandle();
    await page.waitForFunction(element => element === document.activeElement, handle, { timeout: 5000 });
}

describe('when using the shell without optional widgets in Chromium', () => {
    let shell: ShellPage;

    beforeAll(async () => { shell = await openShellPage(); });
    afterAll(async () => { await shell?.browser.close(); });
    beforeEach(async () => {
        await shell.page.evaluate(() => (window as unknown as { resetShell(): void }).resetShell());
    });
    afterEach(() => shell.errors.should.deep.equal([]));

    it('should bundle no optional widget package, preset or icon font', () => {
        shell.inputs.filter(path => /(?:^|[/\\])(?:primereact|primeicons|@primereact|@primeuix)(?:[/\\]|$)|scene\.primereact/i.test(path)).should.deep.equal([]);
    });

    it('should render the styled shell story without unresolved components', async () => {
        (await shell.page.locator('.layout-topbar').count()).should.equal(1);
        (await shell.page.locator('.layout-sidebar').count()).should.equal(1);
        (await shell.page.getByRole('navigation', { name: 'Breadcrumb' }).count()).should.equal(1);
        (await shell.page.locator('.scene-unresolved-component').count()).should.equal(0);
        const fontSize = await shell.page.locator('.layout-breadcrumb-list').evaluate(element => getComputedStyle(element).fontSize);
        fontSize.should.equal('14px');
        if (process.env.SCENE_SHELL_SCREENSHOT) {
            await shell.page.screenshot({ path: process.env.SCENE_SHELL_SCREENSHOT, fullPage: true });
        }
    });

    it('should collapse and reopen the sidebar from the topbar', async () => {
        await shell.page.getByRole('button', { name: 'Close the menu', exact: true }).click();
        await shell.page.locator('.layout-static-inactive').waitFor();
        await shell.page.getByRole('button', { name: 'Open the menu', exact: true }).click();
        (await shell.page.locator('.layout-static-inactive').count()).should.equal(0);
    });

    it('should focus and dismiss the user menu with the keyboard and preserve destination links', async () => {
        const trigger = shell.page.getByRole('button', { name: 'Open the menu for Amelia Nyquist' });
        await trigger.focus();
        await trigger.press('ArrowDown');
        const profile = shell.page.getByRole('menuitem', { name: 'Profile' });
        await profile.waitFor();
        (await profile.getAttribute('href'))!.should.equal('#/ProfileSettings');
        (await profile.evaluate(element => element === document.activeElement)).should.equal(true);
        await shell.page.keyboard.press('ArrowDown');
        (await shell.page.getByRole('menuitem', { name: 'Help' }).evaluate(element => element === document.activeElement)).should.equal(true);
        await shell.page.keyboard.press('Escape');
        (await shell.page.getByRole('menu').count()).should.equal(0);
        await focusReturnsTo(shell.page, trigger);
    });

    it('should keep the drawer open while switching theme and mode, and restore focus on Escape', async () => {
        const trigger = shell.page.getByRole('button', { name: 'Settings', exact: true });
        await trigger.click();
        const dialog = shell.page.getByRole('dialog', { name: 'Settings' });
        await dialog.getByRole('group', { name: 'Theme', exact: true }).getByRole('button', { name: 'Scene Default Dark', exact: true }).click();
        await shell.page.locator('.layout-color-scheme-dark').waitFor();
        (await dialog.evaluate(element => element.closest('[data-scene-color-scheme]')?.getAttribute('data-scene-color-scheme')))!.should.equal('dark');
        await dialog.getByRole('group', { name: 'Menu mode' }).getByRole('button', { name: 'Reveal', exact: true }).click();
        await shell.page.locator('.layout-reveal').waitFor();
        await shell.page.keyboard.press('Escape');
        (await shell.page.getByRole('dialog').count()).should.equal(0);
        await focusReturnsTo(shell.page, trigger);
        await shell.page.locator('.layout-sidebar').hover();
        await shell.page.getByRole('button', { name: 'Pin the menu open' }).click();
        await shell.page.locator('.layout-sidebar-anchored').waitFor();
        await shell.page.getByRole('button', { name: 'Unpin the menu' }).click();
        (await shell.page.locator('.layout-sidebar-anchored').count()).should.equal(0);
    });

    it('should contain drawer focus and dismiss on an outside click', async () => {
        const trigger = shell.page.getByRole('button', { name: 'Settings', exact: true });
        await trigger.click();
        const dialog = shell.page.getByRole('dialog', { name: 'Settings' });
        const close = dialog.getByRole('button', { name: 'Close Settings' });
        await close.focus();
        await shell.page.keyboard.press('Shift+Tab');
        (await dialog.evaluate(element => element.closest('.layout-config-surface')!.contains(document.activeElement))).should.equal(true);
        await shell.page.mouse.click(20, 300);
        (await shell.page.getByRole('dialog').count()).should.equal(0);
        await focusReturnsTo(shell.page, trigger);
    });
});
