// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen } from '@testing-library/react';
import { PrimeDataScroller } from '../data/PrimeDataScroller';
import { sceneComponent } from '../storyElements';

const numbers = (count: number, prefix = 'item') => Array.from({ length: count }, (_, index) => `${prefix} ${index}`);
const subject = (properties: Record<string, unknown>) => <PrimeDataScroller element={sceneComponent('s', 'dataScroller', properties)} slots={{}} />;
const loaded = (container: HTMLElement) => container.querySelectorAll('li').length;

describe('when properties change', () => {
    it('should follow a new rows value', () => {
        const { container, rerender } = render(subject({ items: numbers(40), rows: 5 }));
        loaded(container).should.equal(5);
        rerender(subject({ items: numbers(40), rows: 20 }));
        loaded(container).should.equal(20);
    });

    it('should start over from one chunk when the items are replaced', () => {
        const { container, rerender } = render(subject({ items: numbers(40), rows: 5 }));
        fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
        loaded(container).should.equal(10);
        rerender(subject({ items: numbers(40, 'other'), rows: 5 }));
        loaded(container).should.equal(5);
        container.querySelector('li')!.textContent!.should.equal('other 0');
    });

    it('should keep what was loaded when an unrelated property changes or the items are an equal clone', () => {
        const { container, rerender } = render(subject({ items: numbers(40), rows: 5, ariaLabel: 'One' }));
        fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
        rerender(subject({ items: numbers(40), rows: 5, ariaLabel: 'Two' }));
        loaded(container).should.equal(10);
        screen.getByRole('region', { name: 'Two' });
    });

    it('should never show more than there are when the items shrink', () => {
        const { container, rerender } = render(subject({ items: numbers(40), rows: 30 }));
        rerender(subject({ items: numbers(3), rows: 30 }));
        loaded(container).should.equal(3);
        (screen.queryByRole('button', { name: 'Load more' }) === null).should.equal(true);
    });
});
