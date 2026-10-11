// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Contribution, ExternalComponent, HorizontalAlignment, NavigationItem, VerticalAlignment, Visibility } from '@cratis/scene.model';
import { extractNavigationItem } from '../extractNavigationItem';

function navigationContribution(properties: Record<string, unknown>, order?: number): Contribution {
    const content: ExternalComponent = {
        id: 'nav-item',
        name: 'nav-item',
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

describe('when extracting from a navigation contribution', () => {
    describe('and the required properties are present', () => {
        let result: NavigationItem | undefined;

        beforeEach(() => {
            result = extractNavigationItem(navigationContribution({ label: 'Invoices', targetScreen: 'InvoiceList', group: 'Sales' }, 10));
        });

        it('should extract the label', () => result!.label.should.equal('Invoices'));
        it('should extract the target screen', () => result!.targetScreen.should.equal('InvoiceList'));
        it('should extract the group', () => result!.group!.should.equal('Sales'));
        it('should fall back to the contribution order when the properties bag has none', () => result!.order!.should.equal(10));
    });

    describe('and the item carries the rest of its authored metadata', () => {
        let result: NavigationItem | undefined;

        beforeEach(() => {
            result = extractNavigationItem(navigationContribution({
                id: 'nav:invoices',
                label: 'Invoices',
                icon: 'receipt',
                presentation: 'primary',
                targetScreen: 'InvoiceList',
                destination: { screen: 'InvoiceList', outlet: 'main', kind: 'outlet' },
                hierarchy: ['Billing', 'Invoices', 42],
            }));
        });

        it('should extract the stable id', () => result!.id!.should.equal('nav:invoices'));
        it('should extract the icon', () => result!.icon!.should.equal('receipt'));
        it('should extract the presentation', () => result!.presentation!.should.equal('primary'));
        it('should extract the destination', () => result!.destination!.outlet!.should.equal('main'));
        it('should extract the hierarchy it was declared in, outermost first', () => result!.hierarchy!.should.deep.equal(['Billing', 'Invoices']));
    });

    describe('and the label is missing', () => {
        it('should return undefined', () => {
            (extractNavigationItem(navigationContribution({ targetScreen: 'InvoiceList' })) === undefined).should.be.true;
        });
    });

    describe('and the target screen is missing', () => {
        it('should return undefined', () => {
            (extractNavigationItem(navigationContribution({ label: 'Invoices' })) === undefined).should.be.true;
        });
    });
});
