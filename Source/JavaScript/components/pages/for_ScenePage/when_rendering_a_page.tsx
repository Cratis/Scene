// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render, screen } from '@testing-library/react';
import { externalComponent } from '../../given';
import { ScenePage } from '../ScenePage';

describe('when rendering a page', () => {
    describe('and the screen asks for the title to be shown', () => {
        beforeEach(() => {
            const element = externalComponent('Cratis.Components:page', { title: 'Invoices', showTitle: true });
            render(<ScenePage element={element} slots={{ content: [<span key='body'>Body</span>] }} />);
        });

        it('should render the title as the heading', () => screen.getByRole('heading', { name: 'Invoices' }).should.exist);
        it('should render the content slot', () => screen.getByText('Body').should.exist);
    });

    describe('and the screen leaves the title hidden', () => {
        beforeEach(() => {
            const element = externalComponent('Cratis.Components:page', { title: 'Invoices' });
            render(<ScenePage element={element} slots={{ content: [<span key='body'>Body</span>] }} />);
        });

        it('should render no heading', () => (screen.queryByRole('heading') === null).should.be.true);
        it('should still render the content slot', () => screen.getByText('Body').should.exist);
    });

    describe('and the screen sets the title to something that is not a string', () => {
        beforeEach(() => {
            const element = externalComponent('Cratis.Components:page', { title: 42, showTitle: true });
            render(<ScenePage element={element} slots={{}} />);
        });

        it('should fall back to an empty title rather than rendering the wrong type', () =>
            screen.getByRole('heading').textContent!.should.equal(''));
    });
});
