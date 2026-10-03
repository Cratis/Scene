// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen } from '@testing-library/react';
import { PrimeDataScroller } from '../data/PrimeDataScroller';
import { sceneComponent } from '../storyElements';

const subject = (properties: Record<string, unknown>) => render(<PrimeDataScroller element={sceneComponent('s', 'dataScroller', properties)} slots={{}} />);
const items = (count: number) => Array.from({ length: count }, (_, index) => `item ${index}`);

describe('when loading by button', () => {
    it('should announce how many of how many are shown', () => {
        subject({ items: items(5), rows: 2 });
        screen.getByText('Showing 2 of 5 items').getAttribute('aria-live')!.should.equal('polite');
        fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
        screen.getByText('Showing 4 of 5 items');
    });

    it('should move focus to the first entry it loaded, so the keyboard stays where the new content is', () => {
        subject({ items: items(5), rows: 2 });
        const button = screen.getByRole('button', { name: 'Load more' });
        button.focus();
        fireEvent.click(button);
        document.activeElement!.textContent!.should.equal('item 2');
    });

    it('should keep focus inside the list when the last chunk removes the button', () => {
        subject({ items: items(3), rows: 2 });
        fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
        (screen.queryByRole('button', { name: 'Load more' }) === null).should.equal(true);
        document.activeElement!.textContent!.should.equal('item 2');
    });

    it('should not fire a change for loading, which is not a change of the model', () => {
        const calls: string[] = [];
        render(<PrimeDataScroller element={sceneComponent('s', 'dataScroller', { items: items(5), rows: 2 })} slots={{}} interactions={{ onChange: () => calls.push('change') }} />);
        fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
        calls.should.deep.equal([]);
    });

    it('should disable the button for a disabled element', () => {
        render(<PrimeDataScroller element={{ ...sceneComponent('s', 'dataScroller', { items: items(5), rows: 2 }), isEnabled: false }} slots={{}} />);
        (screen.getByRole('button', { name: 'Load more' }) as HTMLButtonElement).disabled.should.equal(true);
    });
});
