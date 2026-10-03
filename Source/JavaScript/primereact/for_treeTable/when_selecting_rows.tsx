// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, screen } from '@testing-library/react';
import { columns, documents, renderTreeTable } from './given/a_tree_table';
import { render } from '@testing-library/react';
import { PrimeTreeTable } from '../data/PrimeTreeTable';
import { sceneComponent } from '../storyElements';

const selectedRows = (container: HTMLElement) => Array.from(container.querySelectorAll('tbody tr[aria-selected="true"]')).map(row => row.textContent);
const row = (container: HTMLElement, text: string) => Array.from(container.querySelectorAll('tbody tr')).find(candidate => candidate.textContent!.includes(text))!;

describe('when selecting rows', () => {
    describe('and the selection mode is none', () => {
        it('should not mark rows as selectable', () => {
            const { container } = renderTreeTable({ items: documents, columns });
            container.querySelectorAll('tbody tr[aria-selected]').length.should.equal(0);
            fireEvent.click(row(container, 'Music'));
            selectedRows(container).should.deep.equal([]);
        });
    });

    for (const mode of [1, 'Single', 'single']) {
        describe(`and the selection mode is ${JSON.stringify(mode)}`, () => {
            it('should select one row, anywhere on it, and move the selection', () => {
                const { container } = renderTreeTable({ items: documents, columns, selectionMode: mode });
                fireEvent.click(row(container, 'Music'));
                selectedRows(container).should.deep.equal(['MusicFolder']);
                fireEvent.click(row(container, 'Photos').querySelectorAll('td')[1]);
                selectedRows(container).should.deep.equal(['PhotosFolder']);
            });
        });
    }

    for (const mode of [2, 'Multiple']) {
        describe(`and the selection mode is ${JSON.stringify(mode)}`, () => {
            it('should toggle rows independently', () => {
                const { container } = renderTreeTable({ items: documents, columns, selectionMode: mode });
                fireEvent.click(row(container, 'Music'));
                fireEvent.click(row(container, 'Photos'));
                selectedRows(container).should.have.members(['MusicFolder', 'PhotosFolder']);
                fireEvent.click(row(container, 'Music'));
                selectedRows(container).should.deep.equal(['PhotosFolder']);
                screen.getByRole('treegrid').getAttribute('aria-multiselectable')!.should.equal('true');
            });
        });
    }

    it('should not select a node that is not selectable, or anything when disabled', () => {
        const items = [{ key: 'a', label: 'Locked', selectable: false }, { key: 'b', label: 'Open' }];
        const { container } = renderTreeTable({ items, selectionMode: 'single' });
        fireEvent.click(row(container, 'Locked'));
        selectedRows(container).should.deep.equal([]);
        const disabled = renderTreeTable({ items, selectionMode: 'single' }, false);
        fireEvent.click(row(disabled.container, 'Open'));
        selectedRows(disabled.container).should.deep.equal([]);
    });

    it('should not select by clicking the expand button', () => {
        const { container } = renderTreeTable({ items: documents, columns, selectionMode: 'single' });
        fireEvent.click(screen.getByRole('button', { name: 'Collapse Documents' }));
        selectedRows(container).should.deep.equal([]);
    });

    describe('and the authored selection uses a legacy shape', () => {
        const items = [{ key: 5, label: 'Five' }, { key: 'b', label: 'Bee' }, { key: 7, label: 'Seven' }, 'Plain'];

        for (const [description, selection, expected] of [
            ['numeric keys', [5, 7], ['Five', 'Seven']],
            ['mixed string and numeric keys', ['b', 5], ['Five', 'Bee']],
            ['one numeric key', 7, ['Seven']],
            ['{ key } objects, numeric and string', [{ key: 5 }, { key: 'b' }], ['Five', 'Bee']],
            ['one { key } object', { key: 'b' }, ['Bee']],
            ["PrimeReact's key map", { b: { checked: true, partialChecked: false }, 5: { checked: true }, 7: { checked: false, partialChecked: true } }, ['Five', 'Bee']],
            ['a path key of an unkeyed node', ['3'], ['Plain']],
            ['nothing', null, []],
            ['garbage', [null, [], true, {}], []],
        ] as const) {
            it(`should select by ${description}`, () => {
                const { container } = renderTreeTable({ items, selectionMode: 'multiple', selection });
                selectedRows(container).should.have.members([...expected]);
            });
        }
    });

    describe('and the selection mode is not known', () => {
        for (const mode of [9, 'Radio', 'CHECKBOX', null]) {
            it(`should report ${JSON.stringify(mode)} and offer no selection`, () => {
                const { container } = renderTreeTable({ items: documents, columns, selectionMode: mode });
                screen.getByRole('alert').textContent!.should.contain('Unsupported selectionMode');
                container.querySelectorAll('tbody tr[aria-selected]').length.should.equal(0);
            });
        }
    });

    it('should tell the interactions about a selection and leave the authored selection alone', () => {
        const calls: string[] = [];
        const properties = { items: documents, columns, selectionMode: 'single', selection: ['music'] };
        const { container } = render(<PrimeTreeTable element={sceneComponent('t', 'treeTable', properties)} slots={{}} interactions={{ onSelect: () => calls.push('select'), onChange: () => calls.push('change') }} />);
        fireEvent.click(row(container, 'Photos'));
        calls.should.deep.equal(['select', 'change']);
        properties.selection.should.deep.equal(['music']);
    });
});
