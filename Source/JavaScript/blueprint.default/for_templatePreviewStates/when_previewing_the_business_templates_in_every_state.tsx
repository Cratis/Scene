// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, screen, within } from '@testing-library/react';
import { TemplatePreviewState, previewErrorMessage } from '../gallery';
import { provideBrowserApis, renderPreview } from './given';

/**
 * The template kinds an application is assembled from, each with the table its data state changes and a
 * record that appears only while it is populated. Settings has no data to load, so it is checked for its
 * fields instead and must look the same in every state.
 */
const dataTemplates = [
    { screen: 'Dashboard', kind: 'dashboard', record: 'ORD-4192' },
    { screen: 'CrudList', kind: 'list and CRUD', record: 'Bamboo Watch' },
    { screen: 'MasterDetail', kind: 'master/detail', record: 'Fabrikam' },
    { screen: 'UserManagement', kind: 'user administration', record: 'chidi@contoso.com' },
    { screen: 'ModuleWorkspace', kind: 'nested workspace', record: undefined },
];

describe('when previewing the business templates in every state', () => {
    beforeEach(provideBrowserApis);
    afterEach(cleanup);

    for (const template of dataTemplates.filter(candidate => candidate.record)) {
        describe(`and the template is the ${template.kind}`, () => {
            it('should render the seeded records through the PrimeReact table when populated', () => {
                renderPreview(template.screen, TemplatePreviewState.Populated);
                screen.getAllByText(template.record!).length.should.be.greaterThan(0);
                (screen.queryByRole('alert') === null).should.equal(true);
                (document.querySelector('[data-scene-unresolved-component]') === null).should.equal(true);
            });

            it('should keep the headers and show the empty message when empty', () => {
                renderPreview(template.screen, TemplatePreviewState.Empty);
                (screen.queryByText(template.record!) === null).should.equal(true);
                screen.getAllByRole('columnheader').length.should.be.greaterThan(0);
                (document.querySelector('[data-scene-unresolved-component]') === null).should.equal(true);
            });

            it('should announce that it is loading and show no stale records', () => {
                renderPreview(template.screen, TemplatePreviewState.Loading);
                screen.getAllByRole('status').some(status => status.textContent === 'Loading…').should.equal(true);
                (screen.queryByText(template.record!) === null).should.equal(true);
                document.querySelectorAll('[aria-busy="true"]').length.should.be.greaterThan(0);
            });

            it('should announce the error in place of the records', () => {
                renderPreview(template.screen, TemplatePreviewState.Error);
                screen.getAllByRole('alert').map(alert => alert.textContent).should.include(previewErrorMessage);
                (screen.queryByText(template.record!) === null).should.equal(true);
            });

            it('should keep the page heading and actions in every state', () => {
                const headings = Object.values(TemplatePreviewState).map(state => {
                    const { container, unmount } = renderPreview(template.screen, state);
                    const text = container.querySelector('.layout-topbar')?.textContent;
                    unmount();
                    return text;
                });
                new Set(headings).size.should.equal(1);
            });
        });
    }

    it('should render the nested workspace through every level of the chain', () => {
        renderPreview('SliceSection', TemplatePreviewState.Populated);
        (document.querySelector('[data-scene-unresolved-component]') === null).should.equal(true);
        screen.getAllByText('Record an adjustment').length.should.be.greaterThan(0);
    });

    it('should render settings with every field named, identically in every state', () => {
        // Settings loads nothing, so no state may change it. Generated element ids differ per mount and are not compared.
        const markup = Object.values(TemplatePreviewState).map(state => {
            const { container, unmount } = renderPreview('ProfileSettings', state);
            const html = container.innerHTML.replace(/\b(id|for|aria-controls|aria-labelledby|aria-describedby)="[^"]*"/g, '');
            unmount();
            return html;
        });
        new Set(markup).size.should.equal(1);

        renderPreview('ProfileSettings', TemplatePreviewState.Populated);
        Boolean(screen.getByRole('textbox', { name: 'Display name' })).should.equal(true);
        Boolean(screen.getByLabelText('Current password')).should.equal(true);
        within(document.querySelector('.layout-main')!).queryAllByRole('textbox').every(box => box.getAttribute('aria-label')).should.equal(true);
    });
});
