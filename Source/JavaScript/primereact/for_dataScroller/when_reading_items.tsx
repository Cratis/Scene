// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render, screen } from '@testing-library/react';
import { PrimeDataScroller } from '../data/PrimeDataScroller';
import { sceneComponent } from '../storyElements';

const show = (properties: Record<string, unknown>, slots = {}) => render(<PrimeDataScroller element={sceneComponent('s', 'dataScroller', properties)} slots={slots} />);

describe('when reading items', () => {
    it('should read strings and numbers as they are, and skip null', () => {
        const { container } = show({ items: ['One', 2, true, null, 'Five'], rows: 10 });
        Array.from(container.querySelectorAll('li')).map(item => item.textContent).should.deep.equal(['One', '2', 'true', 'Five']);
    });

    it('should read a record by its title field and show the other fields readably, never as JSON', () => {
        const { container } = show({ items: [{ id: 'a', title: 'Invoice', amount: 120, paid: false, customer: { name: 'Ada', tags: ['vip', 'eu'] } }] });
        const item = container.querySelector('li')!;
        item.querySelector('strong')!.textContent!.should.equal('Invoice');
        Array.from(item.querySelectorAll('dt')).map(term => term.textContent).should.deep.equal(['id', 'amount', 'paid', 'customer']);
        Array.from(item.querySelectorAll('dd')).map(detail => detail.textContent).should.deep.equal(['a', '120', 'false', 'name: Ada; tags: vip, eu']);
        item.textContent!.should.not.contain('{');
        item.textContent!.should.not.contain('[object');
    });

    it('should accept a record with no title field', () => {
        const { container } = show({ items: [{ amount: 3 }] });
        (container.querySelector('li strong') === null).should.equal(true);
        container.querySelector('li dd')!.textContent!.should.equal('3');
    });

    it('should refuse serialized legacy UI elements visibly, and not list their fields', () => {
        const { container } = show({ items: ['Kept', { _derivedTypeId: 'PrimeReact.Label', id: 'l1', text: 'Hello' }, { _derivedTypeId: 'PrimeReact.Button', id: 'b1' }] });
        Array.from(container.querySelectorAll('li')).map(item => item.textContent).should.deep.equal(['Kept']);
        screen.getByRole('alert').textContent!.should.equal("2 entries of items are serialized legacy UI elements, which this control does not read. Author them as child elements in the 'items' slot, or as data.");
        container.textContent!.should.not.contain('_derivedTypeId');
        container.textContent!.should.not.contain('Hello');
    });

    it('should say that there is nothing to show for the empty collection the production prototypes carry', () => {
        const { container } = show({ items: [], rows: 10, inline: false, paginator: false });
        screen.getByText('No items to show');
        container.querySelectorAll('li').length.should.equal(0);
        (screen.queryByRole('alert') === null).should.equal(true);
    });

    it('should show child elements authored in the items slot as themselves, after the data rows', () => {
        const { container } = show({ items: ['Data'], rows: 10 }, { items: [<span key='a' data-testid='slotted'>Slotted</span>] });
        Array.from(container.querySelectorAll('li')).map(item => item.textContent).should.deep.equal(['Data', 'Slotted']);
    });

    it('should read the content slot the same way', () => {
        const { container } = show({ rows: 10 }, { content: [<b key='a'>One</b>, <b key='b'>Two</b>] });
        Array.from(container.querySelectorAll('li')).map(item => item.textContent).should.deep.equal(['One', 'Two']);
    });

    it('should not warn about duplicate keys when ids repeat', () => {
        const errors: unknown[][] = [];
        const original = console.error;
        console.error = (...message: unknown[]) => { errors.push(message); };
        try {
            show({ items: [{ id: 'same', label: 'A' }, { id: 'same', label: 'B' }, 'X', 'X'] });
        } finally {
            console.error = original;
        }
        errors.filter(message => String(message[0]).includes('same key')).should.deep.equal([]);
    });

    it('should leave the authored items untouched', () => {
        const items = [{ title: 'A', nested: { b: 1 } }, { _derivedTypeId: 'x' }, null];
        const before = JSON.stringify(items);
        show({ items });
        JSON.stringify(items).should.equal(before);
    });
});
