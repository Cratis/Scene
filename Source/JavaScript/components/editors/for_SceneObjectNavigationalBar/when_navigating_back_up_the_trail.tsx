// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen } from '@testing-library/react';
import { PrimeReactProvider } from '@primereact/core';
import { externalComponent } from '../../given';
import { SceneObjectNavigationalBar } from '../SceneObjectNavigationalBar';

describe('when navigating back up the trail', () => {
    /**
     * The `PrimeReactProvider` became mandatory with PrimeReact 11: every v11 component bottoms out in
     * `usePrimeReact()`, which throws when the context is absent rather than falling back to a default
     * configuration. The bar reaches one through the tooltip on its crumbs, so without this the spec fails
     * at `render` with a provider error instead of exercising the trail at all. No preset is supplied -
     * what is specified here is the navigation behavior, not how a crumb looks.
     */
    beforeEach(() => {
        const element = externalComponent('Cratis.Components:objectNavigationalBar', { navigationPath: ['shipping', 'address', 'street'] });
        render(
            <PrimeReactProvider>
                <SceneObjectNavigationalBar element={element} slots={{}} />
            </PrimeReactProvider>
        );
        fireEvent.click(screen.getByText('address'));
    });

    it('should keep the crumb that was clicked', () => screen.getByText('address').textContent!.should.equal('address'));
    it('should keep everything above it', () => screen.getByText('shipping').textContent!.should.equal('shipping'));
    it('should drop everything below it', () => (screen.queryByText('street') === null).should.be.true);
});
