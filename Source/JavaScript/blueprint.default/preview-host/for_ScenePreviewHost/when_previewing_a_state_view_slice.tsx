// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { PreviewProblem } from '../PreviewProblem';
import { preview } from './when_previewing_a_module';

describe('when previewing a State View slice', () => {
    afterEach(cleanup);

    describe('and the page has a fragment bound to it', () => {
        beforeEach(() => { render(preview({ target: { slice: 'sales.orders.OrderList' } })); });

        it('should render the data fragment of the slice', () => document.querySelector('[data-grid="OrderList"]')!.textContent!.should.equal('OrderList'));
        it('should leave the rest of the page out', () => (document.querySelector('[data-page="orders"]') === null).should.equal(true));
        it('should open no dialog', () => (screen.queryByRole('dialog') === null).should.equal(true));
        it('should host it in a minimal page without a shell', () => [document.querySelector('.layout-topbar'), document.querySelector('nav')].should.deep.equal([null, null]));
    });

    describe('and nothing on the page is bound to it', () => {
        let problems: PreviewProblem[];
        beforeEach(() => {
            problems = [];
            const document = preview().props.children.props.document;
            const bare = { ...document, screens: document.screens.map((candidate: { name: string; slotContent: unknown }) => candidate.name === 'sales.orders' ? { ...candidate, slotContent: { content: [] } } : candidate) };
            render(preview({ document: bare, target: { slice: 'sales.orders.OrderList' }, onProblems: found => problems = found }));
        });

        it('should warn and show the page of the feature, without the shell', () => [problems.filter(problem => problem.code === 'sliceFragmentMissing').map(problem => problem.severity), globalThis.document.querySelector('.layout-topbar'), globalThis.document.querySelector('[data-scene-screen="sales.orders"]') !== null].should.deep.equal([['warning'], null, true]));
    });

    describe('and the slice is an automation', () => {
        it('should show why there is nothing to preview', () => {
            render(preview({ target: { slice: 'sales.orders.Reminder' } }));
            screen.getByRole('alert').textContent!.should.contain('automation');
        });
    });
});
