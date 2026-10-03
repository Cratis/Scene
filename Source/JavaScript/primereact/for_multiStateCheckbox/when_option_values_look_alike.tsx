// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen } from '@testing-library/react';
import { PrimeMultiStateCheckbox } from '../form/PrimeMultiStateCheckbox';
import { sceneComponent } from '../storyElements';

const options = [
    { label: 'number one', value: 1 },
    { label: 'text one', value: '1' },
    { label: 'boolean true', value: true },
    { label: 'text true', value: 'true' },
    { label: 'number zero', value: 0 },
    { label: 'boolean false', value: false },
    { label: 'empty text', value: '' },
];

function cycle(properties: Record<string, unknown>, clicks: number): string[] {
    render(<PrimeMultiStateCheckbox element={sceneComponent('review', 'multiStateCheckbox', { options, empty: false, ...properties })} slots={{}} />);
    const button = screen.getByRole('button');
    const seen = [button.textContent!];
    for (let click = 0; click < clicks; click++) {
        fireEvent.click(button);
        seen.push(button.textContent!);
    }

    return seen;
}

describe('when multi-state option values look alike', () => {
    it('should reach every one of them as a state of its own', () => {
        cycle({ value: 1 }, 7).should.deep.equal([...options.map(option => option.label), 'number one']);
    });

    describe('and the authored value is the text 1', () => {
        it('should select the text option, not the number', () => {
            cycle({ value: '1' }, 0).should.deep.equal(['text one']);
        });
    });

    describe('and the authored value is the number 0', () => {
        it('should select the number, not false or the empty text', () => {
            cycle({ value: 0 }, 0).should.deep.equal(['number zero']);
        });
    });

    describe('and the authored value is false', () => {
        it('should select the boolean, not the number 0 or the empty text', () => {
            cycle({ value: false }, 0).should.deep.equal(['boolean false']);
        });
    });

    describe('and the authored value is the empty text', () => {
        it('should select the empty text, not false or the number 0', () => {
            cycle({ value: '' }, 0).should.deep.equal(['empty text']);
        });
    });

    describe('and the authored value is the text true', () => {
        it('should select the text, not the boolean', () => {
            cycle({ value: 'true' }, 0).should.deep.equal(['text true']);
        });
    });

    describe('and the same value is authored twice among them', () => {
        const duplicated = [{ label: 'first one', value: 1 }, { label: 'text one', value: '1' }, { label: 'second one', value: 1 }];

        it('should step through both duplicates and the lookalike between them', () => {
            cycle({ options: duplicated, value: 1 }, 3).should.deep.equal(['first one', 'text one', 'second one', 'first one']);
        });
    });

    describe('and a value matches no option exactly', () => {
        it('should not fall back to a loosely equal option', () => {
            cycle({ options: [{ label: 'number one', value: 1 }, { label: 'boolean true', value: true }], value: '1' }, 0).should.deep.equal(['No matching state']);
        });
    });

    describe('and an option is the empty text with no label', () => {
        it('should show it as a visible quoted empty text instead of a blank state', () => {
            cycle({ options: ['A', ''], value: 'A' }, 1).should.deep.equal(['A', '""']);
        });
    });
});
