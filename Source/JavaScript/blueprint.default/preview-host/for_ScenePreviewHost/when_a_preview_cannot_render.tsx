// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { PreviewProblem } from '../PreviewProblem';
import { ordersApplication } from './given';
import { preview } from './when_previewing_a_module';

describe('when a preview cannot render', () => {
    afterEach(cleanup);

    describe('and the layout of the page is not provided', () => {
        let problems: PreviewProblem[];
        let selected: PreviewProblem[];
        beforeEach(() => {
            problems = [];
            selected = [];
            const document = ordersApplication();
            document.screens = document.screens.map(candidate => candidate.name === 'sales.orders' ? { ...candidate, layout: 'Ghost' } : candidate);
            render(preview({ document, onProblems: found => problems = found, onSelectProblem: problem => selected.push(problem) }));
        });

        it('should show what is wrong instead of a blank screen', () => screen.getByRole('alert').textContent!.should.contain("uses the layout 'Ghost'"));
        it('should report the problem with its node', () => problems.filter(problem => problem.severity === 'error').map(problem => [problem.code, problem.nodeId]).should.deep.equal([['layoutMissing', 'sales.orders']]));
        it('should link to the node', () => {
            fireEvent.click(screen.getByRole('button', { name: 'Show sales.orders' }));
            selected.map(problem => problem.nodeId).should.deep.equal(['sales.orders']);
        });
    });

    describe('and the model only has warnings', () => {
        it('should render and still report them', () => {
            let problems: PreviewProblem[] = [];
            const document = ordersApplication();
            document.uiProfiles = [{ ...document.uiProfiles![0], sampleData: { activePack: 'missing', mappings: [], bindings: [] } }];
            render(preview({ document, onProblems: found => problems = found }));
            [globalThis.document.querySelector('.layout-topbar') !== null, problems.some(problem => problem.code === 'sampleDataInvalid')].should.deep.equal([true, true]);
        });
    });

    describe('and the problems have not changed between renders', () => {
        it('should report once', () => {
            let reports = 0;
            const { rerender } = render(preview({ target: { module: 'nowhere' }, onProblems: () => reports++ }));
            rerender(preview({ target: { module: 'nowhere' }, onProblems: () => reports++ }));
            reports.should.equal(1);
        });
    });
});
