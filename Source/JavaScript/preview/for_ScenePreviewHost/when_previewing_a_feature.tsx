// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach } from 'vitest';
import { preview } from './when_previewing_a_module';

describe('when previewing a feature', () => {
    afterEach(cleanup);

    describe('and it is not the first of its module', () => {
        let breadcrumbs: string[][];
        beforeEach(() => {
            breadcrumbs = [];
            render(preview({ target: { module: 'sales', feature: 'customers' }, onBreadcrumbChange: breadcrumb => breadcrumbs.push(breadcrumb) }));
        });

        it('should render that feature in the shell', () => document.querySelector('[data-page="customers"]')!.textContent!.should.contain('Customers'));
        it('should keep the navigation of its module', () => Array.from(screen.getByRole('navigation', { name: 'Sidebar' }).querySelectorAll('a, button')).map(item => item.textContent?.trim()).should.deep.equal(['Orders', 'Customers']));
        it('should mark the feature as active', () => within(screen.getByRole('navigation', { name: 'Sidebar' })).getByText('Customers').closest('[aria-current]')!.getAttribute('aria-current')!.should.equal('page'));
        it('should report the module and the feature', () => breadcrumbs.should.deep.equal([['Sales', 'Customers']]));
    });

    describe('and it nests nothing else of the module', () => {
        it('should not render the other features of the module', () => {
            render(preview({ target: { module: 'sales', feature: 'sales.customers' } }));
            (document.querySelector('[data-page="orders"]') === null).should.equal(true);
        });
    });

    describe('and the feature is not in the document', () => {
        it('should show the problem naming the feature', () => {
            const document = { ...preview().props.children.props.document };
            document.screens = document.screens.filter((candidate: { name: string }) => candidate.name !== 'sales.customers');
            render(preview({ document, target: { module: 'sales', feature: 'customers' } }));
            screen.getByRole('alert').textContent!.should.contain("The feature 'sales.customers' has no screen");
        });
    });
});
