// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen } from '@testing-library/react';
import { PrimeMultiStateCheckbox } from '../form/PrimeMultiStateCheckbox';
import { sceneComponent } from '../storyElements';

const options = [{ label: 'Approved', value: 'approved' }, { label: 'Rejected', value: 'rejected' }];

function checkbox(properties: Record<string, unknown>) {
    return <PrimeMultiStateCheckbox element={sceneComponent('review', 'multiStateCheckbox', properties)} slots={{}} />;
}

describe('when the document changes a multi-state checkbox', () => {
    it('should show a changed value, as an inspector edit would set it', () => {
        const rendered = render(checkbox({ options, value: null }));
        rendered.rerender(checkbox({ options, value: 'rejected' }));
        screen.getByRole('button').textContent!.should.equal('Rejected');
    });

    it('should show a value that is hydrated after the first render', () => {
        const rendered = render(checkbox({ options }));
        rendered.rerender(checkbox({ options, value: 'approved' }));
        screen.getByRole('button').textContent!.should.equal('Approved');
    });

    it('should show a changed option list', () => {
        const rendered = render(checkbox({ options, value: 'approved', empty: false }));
        rendered.rerender(checkbox({ options: [{ label: 'Approved (renamed)', value: 'approved' }], value: 'approved', empty: false }));
        screen.getByRole('button').textContent!.should.equal('Approved (renamed)');
    });

    it('should follow a change to whether the empty state is allowed', () => {
        const rendered = render(checkbox({ options, empty: true }));
        rendered.rerender(checkbox({ options, empty: false, value: 'approved' }));
        const button = screen.getByRole('button');
        fireEvent.click(button);
        button.textContent!.should.equal('Rejected');
    });

    it('should keep the position the user chose when an unrelated clone of the document arrives', () => {
        const rendered = render(checkbox({ options: structuredClone(options), value: null }));
        const button = screen.getByRole('button');
        fireEvent.click(button);
        rendered.rerender(checkbox({ options: structuredClone(options), value: null }));
        button.textContent!.should.equal('Approved');
    });

    it('should start again from the document when the value changes after the user moved', () => {
        const rendered = render(checkbox({ options, value: null }));
        const button = screen.getByRole('button');
        fireEvent.click(button);
        rendered.rerender(checkbox({ options, value: 'rejected' }));
        button.textContent!.should.equal('Rejected');
    });
});
