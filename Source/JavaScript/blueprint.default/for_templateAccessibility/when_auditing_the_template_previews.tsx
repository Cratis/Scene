// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render } from '@testing-library/react';
import axe from 'axe-core';
import { TemplatePreviewState } from '../gallery';
import { provideBrowserApis, renderPreview } from '../for_templatePreviewStates/given';

/**
 * The business templates a consuming application assembles screens from. Every one is audited in each data
 * state with axe-core's WCAG A and AA rules for the DOM it renders. Colour contrast and page-level landmark
 * rules need a real layout and a whole page, so jsdom cannot judge them and they are not asserted here.
 */
const templates = ['Dashboard', 'CrudList', 'MasterDetail', 'UserManagement', 'ModuleWorkspace', 'SliceSection', 'ProfileSettings'];

const rules = { runOnly: { type: 'tag' as const, values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }, rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } };

describe('when auditing the template previews for accessibility', () => {
    beforeEach(provideBrowserApis);
    afterEach(cleanup);

    it('should report a violation when a preview has one, so a clean audit is not vacuous', async () => {
        const { container } = render(<div role='progressbar' aria-valuenow={5} />);
        (await axe.run(container, rules)).violations.map(violation => violation.id).should.include('aria-progressbar-name');
    });

    for (const template of templates) {
        for (const state of Object.values(TemplatePreviewState)) {
            it(`should leave the ${template} template without accessibility violations when ${state}`, async () => {
                const { container } = renderPreview(template, state);
                const result = await axe.run(container, rules);
                result.violations.map(violation => `${violation.id}: ${violation.nodes.map(node => node.target.join(' ')).join(', ')}`).should.deep.equal([]);
            });
        }
    }
});
