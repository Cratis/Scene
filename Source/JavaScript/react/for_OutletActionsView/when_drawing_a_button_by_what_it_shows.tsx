// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ProductsPage, Recorded } from './given';

const drawn = (id: string) => document.querySelector(`[data-scene-outlet="rowActions"] > [data-scene-outlet-item="${id}"]`)!;

describe('when drawing a button by what it shows', () => {
    const recorded: Recorded = { opened: [], invoked: [] };

    beforeEach(() => { render(<ProductsPage recorded={recorded} item={{ sku: 'NK-101', name: 'Nordic Kettle' }} />); });
    afterEach(cleanup);

    describe('and it shows only its icon', () => {
        it('should draw the icon', () => (drawn('create').querySelector('[data-scene-icon-name="add"]') !== null).should.be.true);
        it('should not draw the title as text', () => drawn('create').textContent!.should.equal(''));
        it('should keep the title as its accessible name', () => screen.getByRole('button', { name: 'New product' }).getAttribute('data-scene-outlet-item')!.should.equal('create'));
        it('should give the title as its tooltip when nothing holds it back', () => drawn('create').getAttribute('title')!.should.equal('New product'));
        it('should say it shows only its icon', () => drawn('create').getAttribute('data-scene-display')!.should.equal('icon'));
    });

    describe('and it shows only its title', () => {
        it('should not draw the icon', () => (drawn('print').querySelector('[data-scene-icon-name]') === null).should.be.true);
        it('should draw the title', () => drawn('print').textContent!.should.equal('Print'));
        it('should say it shows only its title', () => drawn('print').getAttribute('data-scene-display')!.should.equal('title'));
    });

    describe('and it asks for only its icon but has none', () => {
        it('should draw the title', () => drawn('label').textContent!.should.equal('Label'));
        it('should not say it shows only its icon', () => (drawn('label').getAttribute('data-scene-display') === null).should.be.true);
    });

    describe('and it says nothing about what it shows', () => {
        it('should draw the title', () => drawn('price').textContent!.should.equal('Set price'));
        it('should not name an accessible name of its own', () => (drawn('price').getAttribute('aria-label') === null).should.be.true);
    });
});
