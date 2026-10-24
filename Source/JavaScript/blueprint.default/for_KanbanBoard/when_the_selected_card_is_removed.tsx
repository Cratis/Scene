// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { aBoardWithBindingOutputs, cards } from './given/a_board_with_binding_outputs';

describe('when the selected card is removed', () => {
    afterEach(cleanup);

    it('should publish null and leave no card selected', () => {
        const { published, container, update } = aBoardWithBindingOutputs();
        fireEvent.click(screen.getByRole('button', { name: 'Select First task' }));
        update({ cards: [cards[1]] });
        [published.selectedItem].should.deep.equal([null]);
        container.querySelectorAll('[data-selected="true"]').length.should.equal(0);
        container.querySelectorAll('[aria-pressed="true"]').length.should.equal(0);
        update({ cards });
        [published.selectedItem].should.deep.equal([null]);
        container.querySelectorAll('[aria-pressed="true"]').length.should.equal(0);
    });
});
