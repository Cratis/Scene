// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen } from '@testing-library/react';
import { PrimeMultiStateCheckbox } from '../form/PrimeMultiStateCheckbox';
import { sceneComponent } from '../storyElements';

const review = {
    value: null,
    options: [
        { state: 'approved', title: 'Approved', icon: 'pi pi-check' },
        { state: 'rejected', title: 'Rejected' },
    ],
    optionLabel: 'title',
    optionValue: 'state',
    icons: { rejected: 'pi pi-times' },
    ariaLabel: 'Review status',
};

function renderCheckbox(properties: Record<string, unknown>, interactions = {}) {
    render(<PrimeMultiStateCheckbox element={sceneComponent('review', 'multiStateCheckbox', properties)} slots={{}} interactions={interactions} />);
    return screen.getByRole('button');
}

function shown(button: HTMLElement): string {
    return button.querySelector('span:not([data-scene-part])')!.textContent!;
}

describe('when cycling multi-state checkbox values', () => {
    it('should start on the empty state', () => {
        shown(renderCheckbox(review)).should.equal('No selection');
    });

    it('should start on the empty state when no value was authored', () => {
        shown(renderCheckbox({ options: ['Approved'] })).should.equal('No selection');
    });

    it('should start on the authored value', () => {
        shown(renderCheckbox({ ...review, value: 'rejected' })).should.equal('Rejected');
    });

    it('should cycle states in their authored option order and return to the empty state', () => {
        const button = renderCheckbox(review);
        const seen: string[] = [];
        for (let click = 0; click < 4; click++) {
            fireEvent.click(button);
            seen.push(shown(button));
        }

        seen.should.deep.equal(['Approved', 'Rejected', 'No selection', 'Approved']);
    });

    it('should show the option icon, and the icon keyed by the option value', () => {
        const button = renderCheckbox(review);
        fireEvent.click(button);
        const approved = button.querySelector('.pi-check') !== null;
        fireEvent.click(button);
        const rejected = button.querySelector('.pi-times') !== null;
        [approved, rejected].should.deep.equal([true, true]);
    });

    it('should cycle without the empty state when it is turned off', () => {
        const button = renderCheckbox({ options: ['A', 'B'], value: 'B', empty: false });
        fireEvent.click(button);
        shown(button).should.equal('A');
    });

    it('should cycle numeric and boolean option values without coercing them', () => {
        const button = renderCheckbox({ value: 0, options: [0, false, 1], empty: false });
        const seen = [shown(button)];
        for (let click = 0; click < 3; click++) {
            fireEvent.click(button);
            seen.push(shown(button));
        }

        seen.should.deep.equal(['0', 'false', '1', '0']);
    });

    it('should match structurally equal object values after a document serialization round trip', () => {
        const button = renderCheckbox({ value: { approved: true }, options: [{ label: 'Pending', value: { approved: false } }, { label: 'Approved', value: { approved: true } }], empty: false });
        shown(button).should.equal('Approved');
    });

    it('should keep click, change, and selection actions on the native control', () => {
        const calls: string[] = [];
        const button = renderCheckbox({ options: ['Approved'] }, { onClick: () => calls.push('click'), onChange: () => calls.push('change'), onSelect: () => calls.push('select') });
        fireEvent.click(button);
        calls.should.deep.equal(['click', 'change', 'select']);
    });
});
