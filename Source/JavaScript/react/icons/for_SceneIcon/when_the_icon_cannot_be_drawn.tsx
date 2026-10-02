// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { expect } from 'chai';
import { render, screen, waitFor } from '@testing-library/react';
import { IconAdapter, SceneIcon, createIconAdapterRegistry } from '../../index';
import { adapterFor, alphaHome } from './given/iconAdapters';

describe('when the icon cannot be drawn', () => {
    describe('and the library has no adapter', () => {
        beforeEach(() => {
            render(<SceneIcon reference={{ library: 'unknown', key: 'home' }} adapters={createIconAdapterRegistry()} fallback={<i data-testid="fallback" />} />);
        });

        it('should show the fallback', async () => expect(await screen.findByTestId('fallback')).to.exist);
    });

    describe('and the library has no such icon', () => {
        beforeEach(() => {
            render(<SceneIcon reference={{ library: 'alpha', key: 'rocket' }} adapters={createIconAdapterRegistry([adapterFor('alpha', { home: alphaHome })])} fallback={<i data-testid="fallback" />} />);
        });

        it('should show the fallback rather than another icon', async () => {
            expect(await screen.findByTestId('fallback')).to.have.property('tagName');
            expect(screen.queryByTestId('alpha-home')).to.equal(null);
        });
    });

    describe('and loading fails', () => {
        const failing: IconAdapter = { library: 'alpha', loadGlyph: async () => { throw new Error('offline'); } };

        beforeEach(() => {
            render(<SceneIcon reference={{ library: 'alpha', key: 'home' }} adapters={createIconAdapterRegistry([failing])} fallback={<i data-testid="fallback" />} />);
        });

        it('should show the fallback and mark the state', async () => {
            await waitFor(() => expect(screen.getByTestId('fallback').parentElement!.getAttribute('data-icon-state')).to.equal('unavailable'));
        });
    });
});
