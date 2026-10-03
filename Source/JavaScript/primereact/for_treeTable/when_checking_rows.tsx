// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, screen } from '@testing-library/react';
import { columns, documents, renderTreeTable } from './given/a_tree_table';

const box = (name: string) => screen.getByRole('checkbox', { name: `Select ${name}` }) as HTMLInputElement;
const state = (name: string) => box(name).getAttribute('aria-checked') === 'mixed' ? 'partial' : box(name).checked ? 'checked' : 'unchecked';
const expandAll = { items: documents.map(node => ({ ...node, expanded: true, children: node.children?.map(child => ({ ...child, expanded: true })) })), columns, selectionMode: 'checkbox' };

describe('when checking rows', () => {
    it('should check every descendant when a parent is checked, and show the parent checked', () => {
        renderTreeTable(expandAll);
        fireEvent.click(box('Documents'));
        ['Documents', 'Work', 'Plan', 'Photos'].map(state).should.deep.equal(['checked', 'checked', 'checked', 'checked']);
        state('Music').should.equal('unchecked');
    });

    it('should show a parent partially checked when only some of its children are, in the accessibility tree too', () => {
        renderTreeTable(expandAll);
        fireEvent.click(box('Photos'));
        state('Documents').should.equal('partial');
        box('Documents').indeterminate.should.equal(true);
        box('Documents').getAttribute('aria-checked')!.should.equal('mixed');
        state('Work').should.equal('unchecked');
    });

    it('should check the parent once the last child is checked', () => {
        renderTreeTable(expandAll);
        fireEvent.click(box('Plan'));
        state('Work').should.equal('checked');
        state('Documents').should.equal('partial');
        fireEvent.click(box('Photos'));
        state('Documents').should.equal('checked');
    });

    it('should uncheck one child of a checked parent without checking it again, leaving the parent partial', () => {
        renderTreeTable(expandAll);
        fireEvent.click(box('Documents'));
        fireEvent.click(box('Photos'));
        ['Documents', 'Work', 'Plan', 'Photos'].map(state).should.deep.equal(['partial', 'checked', 'checked', 'unchecked']);
    });

    it('should uncheck the whole subtree when a checked parent is unchecked', () => {
        renderTreeTable(expandAll);
        fireEvent.click(box('Documents'));
        fireEvent.click(box('Documents'));
        ['Documents', 'Work', 'Plan', 'Photos'].map(state).should.deep.equal(['unchecked', 'unchecked', 'unchecked', 'unchecked']);
    });

    it('should check a partially checked parent completely when it is clicked', () => {
        renderTreeTable(expandAll);
        fireEvent.click(box('Plan'));
        fireEvent.click(box('Documents'));
        ['Documents', 'Work', 'Plan', 'Photos'].map(state).should.deep.equal(['checked', 'checked', 'checked', 'checked']);
    });

    it('should cascade an authored parent selection and derive the partial states of its ancestors', () => {
        renderTreeTable({ ...expandAll, selection: ['work'] });
        ['Work', 'Plan'].map(state).should.deep.equal(['checked', 'checked']);
        state('Documents').should.equal('partial');
        state('Photos').should.equal('unchecked');
    });

    it('should read PrimeReact key maps and numeric keys in checkbox mode', () => {
        renderTreeTable({ columns, selectionMode: 3, items: [{ key: 1, label: 'One', expanded: true, children: [{ key: 2, label: 'Two' }, { key: 3, label: 'Three' }] }], selection: { 2: { checked: true }, 1: { partialChecked: true } } });
        ['One', 'Two', 'Three'].map(state).should.deep.equal(['partial', 'checked', 'unchecked']);
    });

    it('should leave nodes that are not selectable out of the cascade', () => {
        const items = [{ key: 'p', label: 'Parent', expanded: true, children: [{ key: 'a', label: 'A' }, { key: 'l', label: 'Locked', selectable: false }] }];
        renderTreeTable({ items, columns, selectionMode: 'checkbox' });
        fireEvent.click(box('Parent'));
        ['Parent', 'A'].map(state).should.deep.equal(['checked', 'checked']);
        (screen.queryByRole('checkbox', { name: 'Select Locked' }) === null).should.equal(true);
    });

    it('should name a checkbox by the key when the node has no label', () => {
        renderTreeTable({ items: [{ key: 'only-a-key' }], selectionMode: 'checkbox', columns: [{ field: 'x', header: 'X' }] });
        screen.getByRole('checkbox', { name: 'Select only-a-key' });
    });

    it('should disable every checkbox and expand button for a disabled element', () => {
        renderTreeTable(expandAll, false);
        for (const control of [...screen.getAllByRole('checkbox'), ...screen.getAllByRole('button')]) (control as HTMLInputElement).disabled.should.equal(true);
    });
});
