// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen } from '@testing-library/react';
import { Control, ExternalComponent, HorizontalAlignment, VerticalAlignment, Visibility } from '@cratis/scene.model';
import { PrimeMultiStateCheckbox } from '../form/PrimeMultiStateCheckbox';

function checkbox(properties: Record<string, unknown>): ExternalComponent {
    const control: Control = {
        id: 'review-state', name: 'Review state', properties, visibility: Visibility.Visible, isEnabled: true, opacity: 1,
        size: {}, zIndex: 0, minimumSize: {}, maximumSize: {}, margin: { left: 0, top: 0, right: 0, bottom: 0 },
        horizontalAlignment: HorizontalAlignment.Stretch, verticalAlignment: VerticalAlignment.Stretch,
        borderThickness: { left: 0, top: 0, right: 0, bottom: 0 }, padding: { left: 0, top: 0, right: 0, bottom: 0 }, tabIndex: 0,
    };
    return { ...control, componentName: 'PrimeReact:multiStateCheckbox', slots: {} };
}

describe('when cycling multi-state checkbox values', () => {
    beforeEach(() => {
        render(
            <PrimeMultiStateCheckbox
                element={checkbox({
                    value: null,
                    empty: true,
                    options: [
                        { state: 'approved', title: 'Approved', icon: 'pi pi-check' },
                        { state: 'rejected', title: 'Rejected' },
                    ],
                    optionLabel: 'title',
                    optionValue: 'state',
                    icons: { rejected: 'pi pi-times' },
                    ariaLabel: 'Review status',
                })}
                slots={{}}
            />
        );
    });

    it('should expose the empty state as a mixed accessible checkbox', () => {
        const control = screen.getByRole('checkbox', { name: 'Review status' });
        const state = control.getAttribute('aria-checked') ?? '';
        state.should.equal('mixed');
        control.textContent!.should.equal('No selection');
    });

    it('should select the empty state by default when a value was not authored', () => {
        const { unmount } = render(<PrimeMultiStateCheckbox element={checkbox({ options: ['Approved'] })} slots={{}} />);
        screen.getAllByText('No selection').length.should.equal(2);
        unmount();
    });

    it('should cycle states in their authored option order', () => {
        const control = screen.getByRole('checkbox');
        fireEvent.click(control);
        control.textContent!.should.equal('Approved');
        const approvedIconMissing = control.querySelector('.pi-check') === null;
        approvedIconMissing.should.equal(false);

        fireEvent.click(control);
        control.textContent!.should.equal('Rejected');
        const rejectedIconMissing = control.querySelector('.pi-times') === null;
        rejectedIconMissing.should.equal(false);

        fireEvent.click(control);
        const state = control.getAttribute('aria-checked') ?? '';
        state.should.equal('mixed');
    });

    it('should cycle numeric and boolean option values without coercing them', () => {
        const { unmount } = render(<PrimeMultiStateCheckbox element={checkbox({ value: 0, options: [0, false], empty: false })} slots={{}} />);
        const control = screen.getAllByRole('checkbox')[1];
        control.textContent!.should.equal('0');
        fireEvent.click(control);
        control.textContent!.should.equal('false');
        unmount();
    });

    it('should match structurally equal values after a document serialization round trip', () => {
        const { unmount } = render(<PrimeMultiStateCheckbox element={checkbox({ value: { approved: true }, options: [{ label: 'Approved', value: { approved: true } }], empty: false })} slots={{}} />);
        screen.getAllByText('Approved').length.should.equal(1);
        unmount();
    });

    it('should keep click, change, and selection actions on the native control', () => {
        let clicks = 0;
        let changes = 0;
        let selections = 0;
        const { unmount } = render(<PrimeMultiStateCheckbox element={checkbox({ options: ['Approved'] })} slots={{}} interactions={{ onClick: () => clicks++, onChange: () => changes++, onSelect: () => selections++ }} />);

        fireEvent.click(screen.getAllByRole('checkbox')[1]);
        [clicks, changes, selections].should.deep.equal([1, 1, 1]);
        unmount();
    });
});
