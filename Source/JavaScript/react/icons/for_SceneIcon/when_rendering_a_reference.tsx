// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { expect } from 'chai';
import { render, screen } from '@testing-library/react';
import { SceneIcon, createIconAdapterRegistry } from '../../index';
import { adapterFor, alphaHome, betaHome } from './given/iconAdapters';

describe('when rendering a reference', () => {
    const registry = createIconAdapterRegistry([adapterFor('alpha', { home: alphaHome }), adapterFor('beta', { home: betaHome })]);

    describe('and the library has an adapter', () => {
        beforeEach(() => {
            render(<SceneIcon reference={{ library: 'alpha', key: 'home' }} adapters={registry} size={24} color="red" label="Home" />);
        });

        it('should draw the adapter\'s glyph', async () => expect(await screen.findByTestId('alpha-home')).to.exist);
        it('should hand the size to the glyph', async () => expect((await screen.findByTestId('alpha-home')).getAttribute('data-size')).to.equal('24'));
        it('should hand the color to the glyph', async () => expect((await screen.findByTestId('alpha-home')).getAttribute('data-color')).to.equal('red'));
        it('should expose the accessible label as an image', async () => {
            await screen.findByTestId('alpha-home');
            expect(screen.getByRole('img', { name: 'Home' })).to.have.property('tagName');
        });
        it('should size the box it sits in', async () => {
            await screen.findByTestId('alpha-home');
            expect(screen.getByRole('img').style.width).to.equal('24px');
        });
    });

    describe('and no label is given', () => {
        beforeEach(() => {
            render(<SceneIcon reference={{ library: 'alpha', key: 'home' }} adapters={registry} />);
        });

        it('should hide the decorative icon from assistive technology', async () => {
            const glyph = await screen.findByTestId('alpha-home');
            expect(glyph.parentElement!.getAttribute('aria-hidden')).to.equal('true');
        });

        it('should default to the surrounding text size and color', async () => {
            const glyph = await screen.findByTestId('alpha-home');
            expect(glyph.getAttribute('data-size')).to.equal('1em');
            expect(glyph.getAttribute('data-color')).to.equal('currentColor');
        });
    });

    describe('and two libraries share the key', () => {
        beforeEach(() => {
            render(<SceneIcon reference={{ library: 'beta', key: 'home' }} adapters={registry} />);
        });

        it('should draw the glyph of the library the reference names', async () => {
            expect(await screen.findByTestId('beta-home')).to.have.property('tagName');
            expect(screen.queryByTestId('alpha-home')).to.equal(null);
        });
    });
});
