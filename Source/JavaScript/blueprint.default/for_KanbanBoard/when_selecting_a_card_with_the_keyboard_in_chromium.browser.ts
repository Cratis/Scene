// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FoundationPage, openFoundationPage } from '../for_foundation/given/a_foundation_page';

const properties = {
    selectionMode: 'single',
    columns: [{ id: 'todo', label: 'To do' }, { id: 'done', label: 'Done' }],
    cards: [{ id: 'one', title: 'First task', column: 'todo' }, { id: 'two', title: 'Second task', column: 'done' }],
};

describe('when selecting a card with the keyboard in Chromium', () => {
    let chromium: FoundationPage;
    beforeAll(async () => { chromium = await openFoundationPage(); });
    afterAll(async () => { await chromium.browser.close(); });

    for (const theme of ['light', 'dark'] as const) {
        it(`should select with Enter and Space and clear with Escape without accessibility violations in the ${theme} theme`, async () => {
            (await chromium.audit('kanbanBoard', theme, properties)).should.deep.equal([]);
            const board = chromium.page.locator('.foundation-board').first();
            const first = board.getByRole('button', { name: 'Select First task' });
            const second = board.getByRole('button', { name: 'Select Second task' });
            await first.focus();
            await first.press('Enter');
            (await first.getAttribute('aria-pressed'))!.should.equal('true');
            const move = board.getByRole('combobox', { name: 'Move First task' });
            await move.focus();
            await move.press('Escape');
            (await first.getAttribute('aria-pressed'))!.should.equal('true');
            (await chromium.audit('kanbanBoard', theme, properties)).should.deep.equal([]);
            await second.focus();
            await second.press('Space');
            (await second.getAttribute('aria-pressed'))!.should.equal('true');
            (await first.getAttribute('aria-pressed'))!.should.equal('false');
            (await board.locator('[data-selected="true"]').count()).should.equal(1);
            await second.press('Escape');
            (await second.getAttribute('aria-pressed'))!.should.equal('false');
            (await board.locator('[data-selected="true"]').count()).should.equal(0);
            (await chromium.page.locator('.foundation-visually-hidden[role="status"]').first().textContent())!.should.equal('Selection cleared');
            chromium.errors.should.deep.equal([]);
        });
    }
});
