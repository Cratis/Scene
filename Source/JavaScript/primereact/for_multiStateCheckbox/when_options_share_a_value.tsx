// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen } from '@testing-library/react';
import { PrimeMultiStateCheckbox } from '../form/PrimeMultiStateCheckbox';
import { sceneComponent } from '../storyElements';

function cycle(properties: Record<string, unknown>, clicks: number): string[] {
    render(<PrimeMultiStateCheckbox element={sceneComponent('review', 'multiStateCheckbox', properties)} slots={{}} />);
    const button = screen.getByRole('button');
    const seen = [button.textContent!];
    for (let click = 0; click < clicks; click++) {
        fireEvent.click(button);
        seen.push(button.textContent!);
    }

    return seen;
}

describe('when multi-state options share a value', () => {
    describe('and an option is null while the empty state is allowed', () => {
        const options = [{ label: 'Approved', value: 'approved' }, { label: 'Nothing', value: null }, { label: 'Rejected', value: 'rejected' }];

        it('should reach every authored state, so none is unreachable behind the empty one', () => {
            cycle({ options }, 4).should.deep.equal(['Nothing', 'Rejected', 'Approved', 'Nothing', 'Rejected']);
        });

        it('should treat the authored null option as the empty state instead of adding a second one', () => {
            const seen = cycle({ options }, 6);
            seen.filter(text => text === 'No selection').length.should.equal(0);
        });

        it('should keep the authored order', () => {
            cycle({ options, value: 'approved' }, 3).should.deep.equal(['Approved', 'Nothing', 'Rejected', 'Approved']);
        });
    });

    describe('and a primitive option is null', () => {
        it('should label it with the empty state label and reach the options after it', () => {
            cycle({ options: ['A', null, 'B'], emptyLabel: 'None' }, 3).should.deep.equal(['None', 'B', 'A', 'None']);
        });
    });

    describe('and two options carry the same value', () => {
        it('should step through both of them', () => {
            const options = [{ label: 'First', value: 'same' }, { label: 'Second', value: 'same' }, { label: 'Third', value: 'other' }];
            cycle({ options, empty: false, value: 'same' }, 3).should.deep.equal(['First', 'Second', 'Third', 'First']);
        });

        it('should step through duplicates when the empty state is allowed', () => {
            const options = [{ label: 'First', value: 'same' }, { label: 'Second', value: 'same' }];
            cycle({ options }, 3).should.deep.equal(['No selection', 'First', 'Second', 'No selection']);
        });
    });

    describe('and an authored value matches no option', () => {
        it('should say so rather than claim no states exist, and move to the first state on click', () => {
            cycle({ options: ['A', 'B'], value: 'missing', empty: false }, 1).should.deep.equal(['No matching state', 'A']);
        });
    });

    describe('and no value was authored while the empty state is not allowed', () => {
        it('should show the empty label rather than invent a selection, and move to the first state on click', () => {
            cycle({ options: ['A', 'B'], empty: false }, 1).should.deep.equal(['No selection', 'A']);
        });
    });

    describe('and there are no options', () => {
        it('should say there are no states, and be disabled', () => {
            render(<PrimeMultiStateCheckbox element={sceneComponent('review', 'multiStateCheckbox', { empty: false })} slots={{}} />);
            const button = screen.getByRole('button') as HTMLButtonElement;
            [button.textContent, button.disabled].should.deep.equal(['No states', true]);
        });
    });
});
