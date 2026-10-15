// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, within } from '@testing-library/react';
import { PrimeReactProvider } from '@primereact/core';
import { afterEach, beforeAll } from 'vitest';
import { corePackage, mergePackageRegistries } from '@cratis/scene.react';
import { defaultBlueprint } from '../defaultBlueprint';
import { ForcedComponentState, GalleryScreenPreview, TemplatePreviewState } from '../gallery';
import { violationsIn } from '../for_foundation/given';
import { provideBrowserApis } from '../for_templatePreviewStates/given';
import { foundationPack, foundationTemplateNames } from './given';
import { ComponentState } from '../foundation';


const registry = mergePackageRegistries([corePackage, defaultBlueprint]);
const preview = (name: string, state: TemplatePreviewState) =>
    render(<PrimeReactProvider><GalleryScreenPreview screenName={name} state={state} registry={registry} pack={foundationPack} /></PrimeReactProvider>);

// Part B 1.4: every data-showing template defines loading, empty, error, no-permission and partial. The foundation components own those states,
// so a template shows them wherever its data does not answer; the preview drives them by what the queries return.
describe('when previewing each foundation template in every state', () => {
    beforeAll(provideBrowserApis);
    afterEach(cleanup);

    for (const name of foundationTemplateNames) {
        for (const state of [TemplatePreviewState.Populated, TemplatePreviewState.Empty]) {
            it(`should render ${name} when ${state} without failing or leaving an accessibility violation`, async () => {
                const { container } = preview(name, state);
                container.textContent!.should.not.contain('Unresolved');
                (container.querySelector('[data-scene-id]') === null).should.equal(false);
                (await violationsIn(container)).should.deep.equal([]);
            });
        }
    }

    it('should say a region is empty, in words, when its query returns nothing', () => {
        const { container } = preview('DashboardScreen', TemplatePreviewState.Empty);
        container.querySelectorAll('.foundation-empty').length.should.be.greaterThan(0);
    });

    it('should show the same screen populated with the pack\'s figures and empty with none of them', () => {
        const populated = preview('ListScreen', TemplatePreviewState.Populated);
        populated.container.textContent!.should.contain('Northgate Ltd');
        cleanup();
        const empty = preview('ListScreen', TemplatePreviewState.Empty);
        empty.container.textContent!.should.not.contain('Northgate Ltd');
    });

    describe('and forcing a standard state on every region', () => {
        // The page header carries the record's name while the regions below are loading, failed or withheld - that is chrome, not a data region, and a
        // user who may not see the record's fields has still navigated to it. What must never leak is what the regions draw.
        const regionText = (container: HTMLElement) => Array.from(container.querySelectorAll('.foundation')).map(region => region.textContent ?? '').join(' ');
        const forced = (name: string, forceState: ForcedComponentState) =>
            render(<PrimeReactProvider><GalleryScreenPreview screenName={name} registry={registry} pack={foundationPack} forceState={forceState} /></PrimeReactProvider>);

        for (const name of ['DashboardScreen', 'ListScreen', 'BoardScreen', 'RecordPage', 'FormScreen']) {
            it(`should show ${name} loading with an announced skeleton and none of its data`, () => {
                const { container } = forced(name, { state: ComponentState.Loading });
                container.querySelectorAll('.foundation-skeleton').length.should.be.greaterThan(0);
                regionText(container).should.not.contain('Northgate Ltd');
                regionText(container).should.not.contain('Acme renewal');
            });

            it(`should show ${name} with a message and a retry when it failed`, () => {
                const { container } = forced(name, { state: ComponentState.Error, error: 'The server did not answer' });
                within(container).getAllByRole('alert').length.should.be.greaterThan(0);
                within(container).getAllByRole('button', { name: 'Try again' }).length.should.be.greaterThan(0);
                regionText(container).should.not.contain('Northgate Ltd');
            });

            it(`should show ${name} saying what is missing and leaking no data when the user has no permission`, () => {
                const { container } = forced(name, { state: ComponentState.NoPermission, permissionSubject: 'the sales data' });
                container.textContent!.should.contain('the sales data');
                regionText(container).should.not.contain('Northgate Ltd');
                regionText(container).should.not.contain('Acme renewal');
            });

            it(`should show ${name} keeping its chrome and naming what failed when it is partial`, () => {
                const { container } = forced(name, { state: ComponentState.Partial, failedRegions: ['Deals'] });
                container.querySelectorAll('[data-state="partial"]').length.should.be.greaterThan(0);
                container.textContent!.should.contain('Deals');
            });

            it(`should leave ${name} without an accessibility violation in each forced state`, async () => {
                for (const state of [ComponentState.Loading, ComponentState.Error, ComponentState.NoPermission, ComponentState.Partial]) {
                    const { container } = forced(name, { state, error: 'The server did not answer', permissionSubject: 'the sales data', failedRegions: ['Deals'] });
                    (await violationsIn(container)).should.deep.equal([]);
                    cleanup();
                }
            });
        }
    });
});
