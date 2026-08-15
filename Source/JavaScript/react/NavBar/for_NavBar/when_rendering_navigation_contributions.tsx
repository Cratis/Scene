// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render, screen } from '@testing-library/react';
import { Contribution, ExternalComponent, HorizontalAlignment, VerticalAlignment, Visibility } from '@cratis/scene.model';
import { NavBar } from '../NavBar';

function navigationContribution(id: string, properties: Record<string, unknown>, order?: number): Contribution {
    const content: ExternalComponent = {
        id,
        name: id,
        properties,
        visibility: Visibility.Visible,
        isEnabled: true,
        opacity: 1,
        size: {},
        zIndex: 0,
        minimumSize: {},
        maximumSize: {},
        margin: { left: 0, top: 0, right: 0, bottom: 0 },
        horizontalAlignment: HorizontalAlignment.Stretch,
        verticalAlignment: VerticalAlignment.Stretch,
        componentName: 'core:navigation-item',
        slots: {},
    };
    return { contributionPointName: 'Navigation', content, order };
}

describe('when rendering navigation contributions', () => {
    describe('and no item declares a group', () => {
        const contributions = [
            navigationContribution('adjustments', { label: 'Adjustments', targetScreen: 'Adjustments' }, 20),
            navigationContribution('invoices', { label: 'Invoices', targetScreen: 'InvoiceList' }, 10),
        ];

        beforeEach(() => {
            render(<NavBar contributions={contributions} renderRoute={item => `/${item.targetScreen}`} />);
        });

        it('should render every item as a link to its rendered route', () => {
            screen.getByRole('link', { name: 'Invoices' }).getAttribute('href')!.should.equal('/InvoiceList');
            screen.getByRole('link', { name: 'Adjustments' }).getAttribute('href')!.should.equal('/Adjustments');
        });

        it('should render items in aggregated order', () => {
            const links = screen.getAllByRole('link').map(link => link.textContent);
            links.should.deep.equal(['Invoices', 'Adjustments']);
        });
    });

    describe('and a contribution cannot be extracted into a navigation item', () => {
        const contributions = [navigationContribution('broken', { label: 'Broken' })];

        beforeEach(() => {
            render(<NavBar contributions={contributions} renderRoute={item => `/${item.targetScreen}`} />);
        });

        it('should skip it rather than render a broken link', () => {
            screen.queryAllByRole('link').should.have.lengthOf(0);
        });
    });
});
