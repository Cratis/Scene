// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen } from '@testing-library/react';
import { externalComponent } from '../../given';
import { SceneObjectNavigationalBar } from '../SceneObjectNavigationalBar';

describe('when navigating back up the trail', () => {
    beforeEach(() => {
        const element = externalComponent('Cratis.Components:objectNavigationalBar', { navigationPath: ['shipping', 'address', 'street'] });
        render(<SceneObjectNavigationalBar element={element} slots={{}} />);
        fireEvent.click(screen.getByText('address'));
    });

    it('should keep the crumb that was clicked', () => screen.getByText('address').textContent!.should.equal('address'));
    it('should keep everything above it', () => screen.getByText('shipping').textContent!.should.equal('shipping'));
    it('should drop everything below it', () => (screen.queryByText('street') === null).should.be.true);
});
