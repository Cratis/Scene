// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { clerk, ProductsPage, Recorded } from './given';

const item = { sku: 'NK-101', name: 'Nordic Kettle' };
const button = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name}`) });

describe('when drawing an outlet of actions', () => {
    let recorded: Recorded;

    beforeEach(() => { recorded = { opened: [], invoked: [] }; });
    afterEach(cleanup);

    describe('and nothing is selected', () => {
        beforeEach(() => { render(<ProductsPage recorded={recorded} />); });

        it('should draw the buttons, separators and groups in the order the outlet resolves them', () =>
            Array.from(document.querySelectorAll('[data-scene-outlet="rowActions"] > [data-scene-outlet-item]')).map(node => node.getAttribute('data-scene-outlet-item'))
                .should.deep.equal(['price', 'withdraw', 'gap', 'details', 'more', 'rowActions-more']));
        it('should draw a group and the menu entries outside any group as menus', () => screen.getAllByRole('button', { name: 'More' }).length.should.equal(2));
        it('should disable an action for an item until one is selected', () => (button('Set price') as HTMLButtonElement).disabled.should.be.true);
        it('should give the enablement reason as the tooltip', () => button('Set price').getAttribute('title')!.should.equal('It is for item, so it waits for a selection'));
        it('should say a slice that opens over the page has a popup', () => button('Set price').getAttribute('aria-haspopup')!.should.equal('dialog'));
    });

    describe('and an item is selected', () => {
        beforeEach(() => { render(<ProductsPage recorded={recorded} item={item} />); });

        it('should enable the action', () => (button('Set price') as HTMLButtonElement).disabled.should.be.false);
        it('should say where the slice opens', () => button('Set price').getAttribute('data-scene-opens')!.should.equal('drawer'));

        describe('and the action opens in a drawer', () => {
            beforeEach(() => { fireEvent.click(button('Set price')); });

            it('should open the slice\'s screen over the page as a drawer', () => screen.getByRole('dialog').getAttribute('data-scene-presentation')!.should.equal('drawer'));
            it('should not change the route', () => recorded.opened.length.should.equal(0));
        });

        describe('and the action runs directly after its confirmation', () => {
            beforeEach(() => {
                fireEvent.click(button('Withdraw'));
                fireEvent.click(document.querySelector('[data-scene-confirm-accept]')!);
            });

            it('should invoke the slice with the inputs the item feeds', () =>
                recorded.invoked.should.deep.equal([{ slice: 'Catalog.Products.WithdrawProduct', payload: { sku: 'NK-101' }, command: 'WithdrawProduct' }]));
        });

        describe('and the action opens in a routed slot', () => {
            beforeEach(() => { fireEvent.click(button('Details')); });

            it('should open the screen in the slot through the router, with the item\'s route values and the slice\'s segment', () =>
                recorded.opened.should.deep.equal([['detail', { screen: 'ProductDetails', parameters: { sku: 'NK-101' }, segment: 'product-details' }]]));
        });
    });

    describe('and the persona cannot issue an action\'s command', () => {
        beforeEach(() => {
            render(<ProductsPage recorded={recorded} item={item} persona={clerk} />);
            fireEvent.click(screen.getByRole('button', { name: 'More' }));
        });

        it('should hide the action, and the group it leaves empty', () =>
            screen.getAllByRole('menuitem').map(entry => entry.textContent).should.deep.equal(['Archive']));
    });
});
