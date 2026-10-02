// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { expect } from 'chai';
import { render, screen } from '@testing-library/react';
import { IconAdapterProvider, SceneIcon, createIconAdapterRegistry } from '../../index';
import { adapterFor, alphaHome } from './given/iconAdapters';

describe('when an adapter provider is in scope', () => {
    beforeEach(() => {
        render(
            <IconAdapterProvider registry={createIconAdapterRegistry([adapterFor('alpha', { home: alphaHome })])}>
                <SceneIcon reference={{ library: 'alpha', key: 'home' }} />
            </IconAdapterProvider>
        );
    });

    it('should render through the provided adapters', async () => expect(await screen.findByTestId('alpha-home')).to.exist);
});
