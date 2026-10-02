// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { expect } from 'chai';
import { render, screen } from '@testing-library/react';
import { SceneIcon, createIconAdapterRegistry } from '../../index';
import { adapterFor, alphaHome } from './given/iconAdapters';

describe('when the same icon is drawn twice', () => {
    const adapter = adapterFor('alpha', { home: alphaHome });

    beforeEach(() => {
        const registry = createIconAdapterRegistry([adapter]);
        render(
            <>
                <SceneIcon reference={{ library: 'alpha', key: 'home' }} adapters={registry} />
                <SceneIcon reference={{ library: 'alpha', key: 'home' }} adapters={registry} />
            </>
        );
    });

    it('should draw both', async () => expect(await screen.findAllByTestId('alpha-home')).to.have.length(2));
    it('should load the artwork once', async () => {
        await screen.findAllByTestId('alpha-home');
        expect(adapter.loads).to.equal(1);
    });
});
