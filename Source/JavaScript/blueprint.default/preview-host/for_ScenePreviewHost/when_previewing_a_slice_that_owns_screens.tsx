// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { Screen, SceneElement } from '@cratis/scene.model';
import { diagnosePreview } from '../diagnosePreview';
import { PreviewProblem } from '../PreviewProblem';
import { ApplicationDocument } from '../ApplicationDocument';
import { element, navigation, ordersApplication, structure } from './given';
import { preview } from './when_previewing_a_module';

const owned = (name: string, owner: string | undefined, content: SceneElement[]): Screen => ({ name, layout: 'AppShell', slotContent: { content }, forms: [], contributions: [], ...(owner === undefined ? {} : { owner }) });

/** The document Stage makes from a Screenplay: every screen names the slice that declared it, and a feature's page is its first screen under the feature's name too. */
function composedApplication(): ApplicationDocument {
    const clerk = owned('Clerk', 'sales.orders.PlaceOrder', [element('place-order-page', 'test:page', { title: 'Place order' })]);
    return {
        ...ordersApplication(),
        screens: [
            owned('dashboard.overview', undefined, [element('overview', 'test:page', { title: 'Overview' })]),
            clerk,
            owned('Lister', 'sales.orders.OrderList', [element('order-list-page', 'test:page', { title: 'Orders' }, { content: [element('order-list', 'test:grid', { query: 'OrderList' })] })]),
            { ...clerk, name: 'sales.orders' },
            owned('Registrar', 'sales.customers.Register', [element('register-page', 'test:page', { title: 'Register customer' })]),
            { ...owned('Registrar', 'sales.customers.Register', [element('register-page', 'test:page', { title: 'Register customer' })]), name: 'sales.customers' },
            owned('Support', 'support.tickets.Raise', [element('tickets-page', 'test:page', { title: 'Tickets' })]),
        ],
    };
}

const pages = () => Array.from(document.querySelectorAll('[data-page]')).map(page => page.getAttribute('data-page'));

describe('when previewing a slice that owns screens', () => {
    afterEach(cleanup);

    describe('and it is a State Change slice', () => {
        let problems: PreviewProblem[];
        beforeEach(() => {
            problems = [];
            render(preview({ document: composedApplication(), target: { slice: 'sales.orders.PlaceOrder' }, onProblems: found => problems = found }));
        });

        it('should draw the screen the slice owns', () => pages().should.deep.equal(['place-order-page']));
        it('should open the task dialog of the slice over it', () => screen.getByRole('dialog').getAttribute('aria-label')!.should.equal('Place order'));
        it('should draw no shell around it (Cratis/Scene#252)', () => [document.querySelector('.layout-topbar'), document.querySelector('nav')].should.deep.equal([null, null]));
        it('should find nothing to warn about', () => problems.should.deep.equal([]));
    });

    describe('and it is a State View slice', () => {
        beforeEach(() => { render(preview({ document: composedApplication(), target: { slice: 'sales.orders.OrderList' } })); });

        it('should draw the data of the slice and nothing of the screens of other slices', () => [document.querySelector('[data-grid="OrderList"]') !== null, pages()].should.deep.equal([true, []]));
    });

    describe('and the navigation of the application leads to screens the preview leaves out', () => {
        beforeEach(() => { render(preview({ document: composedApplication(), target: { slice: 'sales.orders.PlaceOrder' } })); });

        it('should draw no navigation item with the warning marker (Cratis/StudioIssues#1021)', () => document.querySelectorAll('[data-nav-problem]').length.should.equal(0));
        it('should draw no navigation at all', () => document.querySelectorAll('nav').length.should.equal(0));
    });

    describe('and a navigation item leads to a feature of another slice', () => {
        it('should not have loaded that slice\'s screens to draw it', () => {
            render(preview({ document: composedApplication(), target: { slice: 'sales.orders.PlaceOrder' } }));
            [document.querySelector('[data-page="register-page"]'), document.querySelector('[data-page="tickets-page"]'), document.querySelector('[data-page="order-list-page"]')].should.deep.equal([null, null, null]);
        });
    });

    describe('and the slice owns no screen', () => {
        let problems: PreviewProblem[];
        beforeEach(() => {
            problems = [];
            render(preview({ document: composedApplication(), target: { slice: 'sales.customers.Register' }, onProblems: found => problems = found }));
        });

        it('should draw the screen it owns', () => pages().should.deep.equal(['register-page']));

        describe('because the document names none for it', () => {
            beforeEach(() => {
                cleanup();
                problems = [];
                render(preview({ document: { ...composedApplication(), screens: composedApplication().screens.filter(candidate => candidate.owner !== 'sales.customers.Register') }, target: { slice: 'sales.customers.Register' }, onProblems: found => problems = found }));
            });

            it('should draw no screen of any other slice and no shell, with the task dialog over an empty page', () => [pages(), document.querySelector('.layout-topbar'), screen.getByRole('dialog').getAttribute('aria-label')].should.deep.equal([[], null, 'Register']));
            it('should say the slice owns no screen', () => problems.map(problem => [problem.code, problem.severity, problem.nodeId]).should.deep.equal([['sliceScreenMissing', 'warning', 'sales.customers.Register']]));
        });
    });

    describe('and a module is previewed', () => {
        it('should still load the whole document', () => {
            render(preview({ document: composedApplication(), target: { module: 'sales' } }));
            pages().should.deep.equal(['place-order-page']);
        });
    });

    describe('and diagnosing a slice that owns screens', () => {
        const { screen: page, problems } = diagnosePreview({ document: composedApplication(), structure, navigation, target: { slice: 'sales.orders.PlaceOrder' } });

        it('should take the screen it owns as the page', () => page!.name.should.equal('Clerk'));
        it('should not be refused', () => problems.filter(problem => problem.severity === 'error').should.deep.equal([]));
    });
});
