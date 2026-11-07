// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render, screen } from '@testing-library/react';
import { OutletItemKind, OutletNavigationItem } from '@cratis/scene.model';
import { NavBar } from '../NavBar';

function item(id: string, title: string, screenName?: string, children?: OutletNavigationItem[]): OutletNavigationItem {
    return {
        kind: OutletItemKind.Navigation,
        id,
        title,
        ...(screenName === undefined ? {} : { target: { screen: screenName } }),
        ...(children === undefined ? {} : { children }),
    };
}

const route = (navigationItem: OutletNavigationItem) => `/${navigationItem.target?.screen}`;

describe('when rendering navigation items', () => {
    describe('and no item has sub-items', () => {
        beforeEach(() => {
            render(<NavBar items={[item('invoices', 'Invoices', 'InvoiceList'), item('adjustments', 'Adjustments', 'Adjustments')]} renderRoute={route} />);
        });

        it('should render every item as a link to its rendered route', () => {
            screen.getByRole('link', { name: 'Invoices' }).getAttribute('href')!.should.equal('/InvoiceList');
            screen.getByRole('link', { name: 'Adjustments' }).getAttribute('href')!.should.equal('/Adjustments');
        });

        it('should render the items in the order given', () => {
            screen.getAllByRole('link').map(link => link.textContent).should.deep.equal(['Invoices', 'Adjustments']);
        });
    });

    describe('and an item groups sub-items', () => {
        let container: HTMLElement;

        beforeEach(() => {
            ({ container } = render(<NavBar items={[item('workspace', 'Workspace', undefined, [item('dashboard', 'Dashboard', 'Dashboard')])]} renderRoute={route} />));
        });

        it('should render the group with its sub-items', () => {
            container.querySelector('[data-scene-navbar-group="Workspace"]')!.textContent!.should.equal('Dashboard');
        });
    });

    describe('and an item has no target and groups nothing', () => {
        beforeEach(() => {
            render(<NavBar items={[item('broken', 'Broken')]} renderRoute={route} />);
        });

        it('should skip it rather than render a broken link', () => {
            screen.queryAllByRole('link').should.have.lengthOf(0);
        });
    });
});
