// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach } from 'vitest';
import { ScenePreviewHost, ScenePreviewHostProps } from '../ScenePreviewHost';
import { PreviewProblem } from '../PreviewProblem';
import { commandFields, navigation, nordicPack, ordersApplication, registry, structure, withPrime } from './given';

export function preview(props: Partial<ScenePreviewHostProps> = {}) {
    return withPrime(<ScenePreviewHost document={ordersApplication()} structure={structure} navigation={navigation} target={{ module: 'sales' }} registry={registry}
        sampleData={{ packs: [nordicPack] }} fieldsFor={commandFields} {...props} />);
}

const labels = (nav: HTMLElement) => Array.from(nav.querySelectorAll('a, button')).map(item => item.textContent?.trim());
const topbar = () => screen.getByRole('navigation', { name: 'Modules' });
const sidebar = () => screen.getByRole('navigation', { name: 'Sidebar' });

describe('when previewing a module', () => {
    afterEach(cleanup);

    describe('and the module has features', () => {
        let breadcrumbs: string[][];
        beforeEach(() => {
            breadcrumbs = [];
            render(preview({ onBreadcrumbChange: breadcrumb => breadcrumbs.push(breadcrumb) }));
        });

        it('should render the shell with the topbar of the application', () => labels(topbar()).should.deep.equal(['Dashboard', 'Sales', 'Support']));
        it('should show the logo of the application', () => document.querySelector('.layout-logo')!.textContent!.should.contain('Acme'));
        it('should show the effective sidebar of the module', () => labels(sidebar()).should.deep.equal(['Orders', 'Customers']));
        it('should render the first feature of the module', () => document.querySelector('[data-page="orders"]')!.textContent!.should.contain('Orders'));
        it('should mark the module of the page as active in the topbar', () => within(topbar()).getByText('Sales').closest('[aria-current]')!.getAttribute('aria-current')!.should.equal('page'));
        it('should mark the feature of the page as active in the sidebar', () => within(sidebar()).getByText('Orders').closest('[aria-current]')!.getAttribute('aria-current')!.should.equal('page'));
        it('should report what is being previewed', () => breadcrumbs.should.deep.equal([['Sales', 'Orders']]));
        it('should say what it is previewing', () => document.querySelector('.scene-preview-host')!.getAttribute('data-preview-breadcrumb')!.should.equal('Sales › Orders'));
        it('should draw no design chrome and no dialog', () => [document.querySelector('[data-design-mode]'), screen.queryByRole('dialog')].should.deep.equal([null, null]));
    });

    describe('and the user navigates to another module', () => {
        beforeEach(() => {
            render(preview());
            fireEvent.click(within(topbar()).getByText('Support'));
        });

        it('should swap the sidebar for the support module', () => labels(sidebar()).should.deep.equal(['Tickets', 'Knowledge base']));
        it('should extend the topbar with the module items', () => labels(topbar()).should.deep.equal(['Dashboard', 'Sales', 'Support', 'Help center']));
        it('should render the first feature of the module it went to', () => document.querySelector('[data-page="tickets"]')!.textContent!.should.contain('Tickets'));

        describe('and goes back to sales and opens customers', () => {
            beforeEach(() => {
                fireEvent.click(within(topbar()).getByText('Sales'));
                fireEvent.click(within(sidebar()).getByText('Customers'));
            });

            it('should restore the sales navigation', () => labels(sidebar()).should.deep.equal(['Orders', 'Customers']));
            it('should render the feature it opened', () => document.querySelector('[data-page="customers"]')!.textContent!.should.contain('Customers'));
        });
    });

    describe('and navigating inside a preview', () => {
        it('should leave the address of the page it is hosted in alone', () => {
            const before = globalThis.location.href;
            render(preview());
            fireEvent.click(within(topbar()).getByText('Support'));
            globalThis.location.href.should.equal(before);
        });
    });

    describe('and a navigation item is hidden by the host', () => {
        it('should hide it rather than disable it', () => {
            render(preview({ isVisible: item => item.title !== 'Customers' }));
            labels(sidebar()).should.deep.equal(['Orders']);
        });
    });

    describe('and the module has none of what it needs', () => {
        let problems: PreviewProblem[];
        beforeEach(() => {
            problems = [];
            render(preview({ target: { module: 'empty' }, onProblems: found => problems = found }));
        });

        it('should show the problem instead of a blank screen', () => screen.getByRole('alert').textContent!.should.contain("The module 'Empty' has no feature to show."));
        it('should report it with the node to go to', () => problems.filter(problem => problem.severity === 'error').map(problem => [problem.code, problem.nodeId]).should.deep.equal([['moduleWithoutFeatures', 'empty']]));
    });

    describe('and the target is not in the application', () => {
        it('should show the problems and not the shell', () => {
            render(preview({ target: { module: 'nowhere' } }));
            [screen.getByRole('alert').textContent!.includes('nowhere'), document.querySelector('.layout-topbar')].should.deep.equal([true, null]);
        });
    });
});
