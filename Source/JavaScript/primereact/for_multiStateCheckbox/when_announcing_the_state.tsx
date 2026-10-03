// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen } from '@testing-library/react';
import { PrimeMultiStateCheckbox } from '../form/PrimeMultiStateCheckbox';
import { sceneComponent } from '../storyElements';

const properties = {
    value: null,
    options: [{ label: 'Approved', value: 'approved' }, { label: 'Rejected', value: 'rejected' }],
    ariaLabel: 'Review status',
};

function renderCheckbox(extra: Record<string, unknown> = {}) {
    render(<PrimeMultiStateCheckbox element={sceneComponent('review', 'multiStateCheckbox', { ...properties, ...extra })} slots={{}} />);
    return screen.getByRole('button', { name: 'Review status' });
}

function description(button: HTMLElement): string {
    return button.getAttribute('aria-describedby')!.split(' ').map(id => document.getElementById(id)!.textContent).join(' ');
}

describe('when announcing the state of a multi-state checkbox', () => {
    it('should name the control by its label, not by its current state', () => {
        renderCheckbox();
        screen.getByRole('button').getAttribute('aria-label')!.should.equal('Review status');
    });

    it('should describe the control by its current state', () => {
        const button = renderCheckbox();
        description(button).should.equal('No selection');
        fireEvent.click(button);
        description(button).should.equal('Approved');
    });

    it('should announce a state change through a polite live region', () => {
        const button = renderCheckbox();
        fireEvent.click(button);
        const region = document.getElementById(button.getAttribute('aria-describedby')!)!;
        [region.getAttribute('role'), region.textContent].should.deep.equal(['status', 'Approved']);
    });

    it('should not claim the control is checked or unchecked for any state', () => {
        const button = renderCheckbox();
        const attributes: (string | null)[] = [];
        for (let click = 0; click < 3; click++) {
            attributes.push(button.getAttribute('aria-checked'), button.getAttribute('role'));
            fireEvent.click(button);
        }

        attributes.should.deep.equal([null, null, null, null, null, null]);
    });

    it('should not announce the visible state text a second time', () => {
        const button = renderCheckbox();
        button.querySelector('span[aria-hidden="true"]:not([data-scene-part])')!.textContent!.should.equal('No selection');
    });

    it('should hide the decorative glyph from assistive technology', () => {
        renderCheckbox().querySelector('[data-scene-part="glyph"]')!.getAttribute('aria-hidden')!.should.equal('true');
    });

    it('should use the element name when no accessible name was authored', () => {
        render(<PrimeMultiStateCheckbox element={{ ...sceneComponent('review', 'multiStateCheckbox', { options: ['A'] }), name: 'Review state' }} slots={{}} />);
        screen.getByRole('button', { name: 'Review state' }).getAttribute('aria-label')!.should.equal('Review state');
    });
});
