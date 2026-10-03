// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, screen } from '@testing-library/react';
import { columns, documents, renderTreeTable } from './given/a_tree_table';

const rows = () => screen.getAllByRole('row').slice(1);
const label = (row: HTMLElement) => row.querySelector('td')!.textContent!.replace(/^(Expand|Collapse)/, '');
const key = (row: HTMLElement, name: string) => fireEvent.keyDown(row, { key: name });

describe('when navigating by keyboard', () => {
    it('should be a tree grid of rows and cells, with the position of each row', () => {
        renderTreeTable({ items: documents, columns, ariaLabel: 'Files' });
        screen.getByRole('treegrid', { name: 'Files' });
        screen.getAllByRole('columnheader').length.should.equal(2);
        const [documentsRow, workRow] = rows();
        [documentsRow, workRow].map(row => [row.getAttribute('aria-level'), row.getAttribute('aria-posinset'), row.getAttribute('aria-setsize'), row.getAttribute('aria-expanded')])
            .should.deep.equal([['1', '1', '2', 'true'], ['2', '1', '2', 'false']]);
        (rows()[3].getAttribute('aria-expanded') === null).should.equal(true);
    });

    it('should name each expand button after its row', () => {
        renderTreeTable({ items: documents, columns });
        screen.getByRole('button', { name: 'Collapse Documents' });
        screen.getByRole('button', { name: 'Expand Work' });
    });

    it('should keep exactly one row in the tab order', () => {
        renderTreeTable({ items: documents, columns });
        rows().map(row => row.getAttribute('tabindex')).should.deep.equal(['0', '-1', '-1', '-1']);
        screen.getAllByRole('button').forEach(button => button.getAttribute('tabindex')!.should.equal('-1'));
    });

    it('should move between rows with the arrow keys, and to the ends with Home and End', () => {
        renderTreeTable({ items: documents, columns });
        rows()[0].focus();
        key(rows()[0], 'ArrowDown');
        label(document.activeElement as HTMLElement).should.equal('Work');
        key(document.activeElement as HTMLElement, 'ArrowDown');
        label(document.activeElement as HTMLElement).should.equal('Photos');
        key(document.activeElement as HTMLElement, 'End');
        label(document.activeElement as HTMLElement).should.equal('Music');
        key(document.activeElement as HTMLElement, 'ArrowDown');
        label(document.activeElement as HTMLElement).should.equal('Music');
        key(document.activeElement as HTMLElement, 'Home');
        label(document.activeElement as HTMLElement).should.equal('Documents');
        key(document.activeElement as HTMLElement, 'ArrowUp');
        label(document.activeElement as HTMLElement).should.equal('Documents');
        rows().map(row => row.getAttribute('tabindex')).should.deep.equal(['0', '-1', '-1', '-1']);
    });

    it('should expand with Right, enter the first child with Right again, collapse with Left and go to the parent with Left', () => {
        renderTreeTable({ items: documents, columns });
        const work = rows()[1];
        work.focus();
        key(work, 'ArrowRight');
        work.getAttribute('aria-expanded')!.should.equal('true');
        rows().length.should.equal(5);
        key(work, 'ArrowRight');
        label(document.activeElement as HTMLElement).should.equal('Plan');
        key(document.activeElement as HTMLElement, 'ArrowLeft');
        label(document.activeElement as HTMLElement).should.equal('Work');
        key(document.activeElement as HTMLElement, 'ArrowLeft');
        rows().length.should.equal(4);
        key(document.activeElement as HTMLElement, 'ArrowLeft');
        label(document.activeElement as HTMLElement).should.equal('Documents');
    });

    it('should select with Space and Enter, in single and in checkbox mode', () => {
        const single = renderTreeTable({ items: documents, columns, selectionMode: 'single' });
        const music = rows()[3];
        music.focus();
        key(music, ' ');
        music.getAttribute('aria-selected')!.should.equal('true');
        single.unmount();

        renderTreeTable({ items: documents, columns, selectionMode: 'checkbox' });
        const photos = rows()[2];
        photos.focus();
        key(photos, 'Enter');
        (screen.getByRole('checkbox', { name: 'Select Photos' }) as HTMLInputElement).checked.should.equal(true);
    });

    it('should leave keys pressed on the expand button and the checkbox to those controls', () => {
        renderTreeTable({ items: documents, columns, selectionMode: 'checkbox' });
        fireEvent.keyDown(screen.getByRole('button', { name: 'Expand Work' }), { key: 'ArrowDown' });
        rows().length.should.equal(4);
    });

    it('should not expand a row of a disabled element', () => {
        renderTreeTable({ items: documents, columns }, false);
        const work = rows()[1];
        work.focus();
        key(work, 'ArrowRight');
        work.getAttribute('aria-expanded')!.should.equal('false');
    });

    describe('and the table is paginated', () => {
        it('should keep focus on the page buttons, which stay in the tab order when they cannot act', () => {
            renderTreeTable({ items: [{ label: 'A' }, { label: 'B' }, { label: 'C' }], paginator: true, rows: 2, columns: [{ field: 'label', header: 'L' }] });
            const next = screen.getByRole('button', { name: 'Next' });
            next.focus();
            fireEvent.click(next);
            screen.getByText('2 / 2');
            (document.activeElement === next).should.equal(true);
            next.getAttribute('aria-disabled')!.should.equal('true');
            fireEvent.click(next);
            screen.getByText('2 / 2');
            screen.getByRole('button', { name: 'Previous' }).getAttribute('aria-disabled')!.should.equal('false');
        });

        it('should clamp the page when the items shrink, keeping every row reachable', () => {
            const { rerender } = renderTreeTable({ items: [{ label: 'A' }, { label: 'B' }, { label: 'C' }], paginator: true, rows: 1 });
            void rerender;
            fireEvent.click(screen.getByRole('button', { name: 'Next' }));
            fireEvent.click(screen.getByRole('button', { name: 'Next' }));
            screen.getByText('3 / 3');
        });
    });
});
