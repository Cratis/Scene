// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen } from '@testing-library/react';
import { PrimeMultiStateCheckbox } from '../form/PrimeMultiStateCheckbox';
import { sceneComponent } from '../storyElements';

function renderCheckbox(properties: Record<string, unknown>, isEnabled = true, interactions = {}) {
    render(<PrimeMultiStateCheckbox element={{ ...sceneComponent('review', 'multiStateCheckbox', { options: ['A', 'B'], empty: false, value: 'A', ...properties }), isEnabled }} slots={{}} interactions={interactions} />);
    return screen.getByRole('button') as HTMLButtonElement;
}

describe('when a multi-state checkbox is not interactive', () => {
    describe('and it is disabled by its property', () => {
        it('should be a disabled button that does not cycle', () => {
            const button = renderCheckbox({ disabled: true });
            fireEvent.click(button);
            [button.disabled, button.textContent].should.deep.equal([true, 'A']);
        });
    });

    describe('and the element is not enabled', () => {
        it('should be a disabled button', () => {
            renderCheckbox({}, false).disabled.should.equal(true);
        });
    });

    describe('and it is read only', () => {
        it('should stay focusable and keep its state when clicked', () => {
            const button = renderCheckbox({ readOnly: true });
            fireEvent.click(button);
            [button.disabled, button.textContent].should.deep.equal([false, 'A']);
        });

        it('should tell assistive technology it is not available for change', () => {
            renderCheckbox({ readOnly: true }).getAttribute('aria-disabled')!.should.equal('true');
        });

        it('should not raise change or selection actions', () => {
            const calls: string[] = [];
            const button = renderCheckbox({ readOnly: true }, true, { onChange: () => calls.push('change'), onSelect: () => calls.push('select'), onClick: () => calls.push('click') });
            fireEvent.click(button);
            calls.should.deep.equal(['click']);
        });
    });

    describe('and it is interactive', () => {
        it('should not be marked read only or disabled', () => {
            const button = renderCheckbox({});
            [button.disabled, button.getAttribute('aria-disabled')].should.deep.equal([false, null]);
        });
    });
});
