// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { afterEach } from 'vitest';
import { renderShell } from '../for_RegionNavigation/given';

/** The same axe-core WCAG A and AA rules the template previews are audited with; contrast and page-level landmarks need a real page. */
const rules = { runOnly: { type: 'tag' as const, values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }, rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } };

const violations = async (container: HTMLElement) =>
    (await axe.run(container, rules)).violations.map(violation => `${violation.id}: ${violation.nodes.map(node => node.target.join(' ')).join(', ')}`);

describe('when auditing the navigation regions for accessibility', () => {
    afterEach(cleanup);

    it('should leave the topbar and sidebar of a module without violations', async () => {
        const { container } = render(renderShell('sales.orders'));
        (await violations(container)).should.deep.equal([]);
    });

    it('should leave them without violations with a collapsed parent', async () => {
        const { container } = render(renderShell('sales.customers'));
        (await violations(container)).should.deep.equal([]);
    });

    it('should leave them without violations after navigating to another module and into a slot', async () => {
        const { container } = render(renderShell('dashboard.overview'));
        fireEvent.click(screen.getByRole('link', { name: 'Support' }));
        fireEvent.click(screen.getByRole('link', { name: 'Knowledge base' }));
        (await violations(container)).should.deep.equal([]);
    });

    it('should expose the regions as labelled navigation landmarks', () => {
        render(renderShell('sales.orders'));
        screen.getAllByRole('navigation').map(landmark => landmark.getAttribute('aria-label')).should.deep.equal(['Modules', 'Sidebar']);
    });
});
