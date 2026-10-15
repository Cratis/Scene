// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, within } from '@testing-library/react';
import { PrimeReactProvider } from '@primereact/core';
import { afterEach, beforeAll } from 'vitest';
import { ComponentState } from '../foundation';
import { ForcedComponentState, GalleryDialogPreview, TemplatePreviewState } from '../gallery';
import { violationsIn } from '../for_foundation/given';
import { packageBackedRegistry, provideBrowserApis } from '../for_templatePreviewStates/given';
import { dialogNames, foundationPack } from './given';

const registry = packageBackedRegistry;
const preview = (name: string, state: TemplatePreviewState = TemplatePreviewState.Populated, forceState?: ForcedComponentState) =>
    render(<PrimeReactProvider><GalleryDialogPreview dialogName={name} registry={registry} pack={foundationPack} state={state} forceState={forceState} /></PrimeReactProvider>);

// Part B 1.4 and 6 for dialogs: standard states previewable, no accessibility violation in any of them, and the preview data from the sample-data pack.
describe('when previewing each dialog in every state', () => {
    beforeAll(provideBrowserApis);
    afterEach(cleanup);

    for (const name of dialogNames) {
        for (const state of [TemplatePreviewState.Populated, TemplatePreviewState.Empty]) {
            it(`should render ${name} when ${state} without leaving an unresolved component or an accessibility violation`, async () => {
                const { container } = preview(name, state);
                (container.querySelector('[data-scene-unresolved-component]') === null).should.equal(true);
                container.textContent!.should.not.contain('Unresolved');
                (await violationsIn(container)).should.deep.equal([]);
            });
        }
    }

    it('should draw the lookup with the pack\'s accounts, and say in words that there are none when the query returns nothing', () => {
        const populated = preview('LookupDialog');
        populated.container.textContent!.should.contain('Northgate Ltd');
        cleanup();
        const empty = preview('LookupDialog', TemplatePreviewState.Empty);
        empty.container.textContent!.should.not.contain('Northgate Ltd');
        empty.container.querySelectorAll('.foundation-empty').length.should.be.greaterThan(0);
    });

    it('should draw the filter dialog with the fields of the pack', () => {
        const { container } = preview('FilterDialog');
        container.textContent!.should.contain('Owner');
    });

    describe('and forcing a standard state on the regions of the dialog', () => {
        for (const name of ['LookupDialog', 'FilterDialog', 'SideSheet', 'QuickCreateDialog']) {
            it(`should show ${name} loading with an announced skeleton and none of its data`, () => {
                const { container } = preview(name, TemplatePreviewState.Populated, { state: ComponentState.Loading });
                container.querySelectorAll('.foundation-skeleton').length.should.be.greaterThan(0);
                container.textContent!.should.not.contain('Northgate Ltd');
            });

            it(`should show ${name} with a message and a retry when it failed`, () => {
                const { container } = preview(name, TemplatePreviewState.Populated, { state: ComponentState.Error, error: 'The server did not answer' });
                within(container).getAllByRole('alert').length.should.be.greaterThan(0);
                within(container).getAllByRole('button', { name: 'Try again' }).length.should.be.greaterThan(0);
            });

            it(`should show ${name} saying what is missing, with no data, when the user has no permission`, () => {
                const { container } = preview(name, TemplatePreviewState.Populated, { state: ComponentState.NoPermission, permissionSubject: 'the accounts' });
                container.textContent!.should.contain('the accounts');
                container.textContent!.should.not.contain('Northgate Ltd');
            });

            it(`should leave ${name} without an accessibility violation in each forced state`, async () => {
                for (const state of [ComponentState.Loading, ComponentState.Error, ComponentState.NoPermission, ComponentState.Partial]) {
                    const { container } = preview(name, TemplatePreviewState.Populated, { state, error: 'The server did not answer', permissionSubject: 'the accounts', failedRegions: ['Accounts'] });
                    (await violationsIn(container)).should.deep.equal([]);
                    cleanup();
                }
            });
        }
    });
});
