// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { aBoardWithBindingOutputs } from './given/a_board_with_binding_outputs';

describe('when selection is not enabled', () => {
    afterEach(cleanup);

    for (const selectionMode of [undefined, 'none']) {
        it(`should leave titles as text and publish null with selection mode ${selectionMode ?? 'omitted'}`, () => {
            const { container, published } = aBoardWithBindingOutputs({ selectionMode });
            container.querySelectorAll('.foundation-board-card button').length.should.equal(0);
            container.querySelectorAll('.foundation-board-card strong').length.should.equal(2);
            [published.selectedItem].should.deep.equal([null]);
        });
    }

    it('should clear an existing selection when selection is turned off', () => {
        const { update, published, container } = aBoardWithBindingOutputs();
        fireEvent.click(screen.getByRole('button', { name: 'Select First task' }));
        update({ selectionMode: 'none' });
        [published.selectedItem].should.deep.equal([null]);
        container.querySelectorAll('[data-selected="true"]').length.should.equal(0);
        update({ selectionMode: 'single' });
        [published.selectedItem].should.deep.equal([null]);
    });
});
