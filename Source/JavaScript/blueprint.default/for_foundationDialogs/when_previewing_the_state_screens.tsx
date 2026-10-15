// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, screen } from '@testing-library/react';
import { PrimeReactProvider } from '@primereact/core';
import { afterEach, beforeAll } from 'vitest';
import { corePackage, mergePackageRegistries } from '@cratis/scene.react';
import { defaultBlueprint } from '../defaultBlueprint';
import { GalleryScreenPreview, TemplatePreviewState } from '../gallery';
import { forbiddenScreenTemplate, stateScreenTemplates } from '../foundation/templates';
import { elementsOf } from '../for_foundationTemplates/given';
import { violationsIn } from '../for_foundation/given';
import { provideBrowserApis } from '../for_templatePreviewStates/given';
import { foundationPack, stateScreenNames } from './given';

const registry = mergePackageRegistries([corePackage, defaultBlueprint]);
const preview = (name: string, state: TemplatePreviewState = TemplatePreviewState.Populated) =>
    render(<PrimeReactProvider><GalleryScreenPreview screenName={name} registry={registry} pack={foundationPack} state={state} /></PrimeReactProvider>);

// Part B 2.11: login (identity-provider slot, error area, help link), not found (explanation, search, link home), forbidden (explanation, request access, no data
// leaked) and error (generic failure, retry, support reference id).
describe('when previewing the auth and state screens', () => {
    beforeAll(provideBrowserApis);
    afterEach(cleanup);

    for (const name of stateScreenNames) {
        for (const state of [TemplatePreviewState.Populated, TemplatePreviewState.Empty]) {
            it(`should render ${name} when ${state} without an unresolved component or an accessibility violation`, async () => {
                const { container } = preview(name, state);
                container.textContent!.should.not.contain('Unresolved');
                (container.querySelector('[data-scene-id]') === null).should.equal(false);
                (await violationsIn(container)).should.deep.equal([]);
            });
        }

        it(`should render ${name} in the chrome-less full-page layout, with no navigation around it`, () => {
            const { container } = preview(name);
            (container.querySelector('.layout-sidebar, .layout-topbar') === null).should.equal(true);
        });
    }

    it('should draw the sign-in screen with a logo, a form, the identity providers and a help link', () => {
        const { container } = preview('LoginScreen');
        (container.querySelector('[data-scene-id="login-logo"]') === null).should.equal(false);
        screen.getByLabelText(/Email/);
        (screen.getByLabelText(/Password/) as HTMLInputElement).type.should.equal('password');
        screen.getByRole('button', { name: 'Sign in' });
        screen.getByRole('button', { name: 'Continue with Microsoft' });
        screen.getByRole('button', { name: 'Continue with GitHub' });
        screen.getByRole('button', { name: 'Need help signing in?' });
    });

    it('should announce why a sign-in failed in an alert, and keep the area on the page but empty when nothing failed', () => {
        const failed = preview('LoginScreen');
        screen.getByRole('alert', { name: '' }).textContent!.should.contain('The email or password is not right.');
        cleanup();
        const clean = preview('LoginScreen', TemplatePreviewState.Empty);
        const area = clean.container.querySelector('.foundation-notice')!;
        [area.getAttribute('role'), area.textContent].should.deep.equal(['alert', '']);
        failed.container.remove();
    });

    it('should explain a wrong address in words, with a search and a way home', () => {
        const { container } = preview('NotFoundScreen');
        container.textContent!.should.contain('That page is not here');
        screen.getByRole('search');
        screen.getByRole('button', { name: 'Back to the dashboard' });
    });

    it('should offer to request access on the forbidden screen and show none of what was refused', () => {
        const { container } = preview('ForbiddenScreen');
        container.textContent!.should.contain('You do not have access to this');
        screen.getByRole('button', { name: 'Request access' });
        Object.keys(foundationPack.sets.map(set => set.shape).filter(shape => container.textContent!.includes(shape))).should.deep.equal([]);
    });

    it('should bind the forbidden screen to no data at all, so there is nothing to leak', () => {
        const queries = elementsOf(Object.values(forbiddenScreenTemplate.content ?? {}).flat())
            .flatMap(element => Object.values((element as { properties?: Record<string, unknown> }).properties ?? {}))
            .filter(value => typeof value === 'object' && value !== null && 'query' in value);
        queries.should.deep.equal([]);
    });

    it('should offer a retry and the support reference id to quote on the error screen', () => {
        const { container } = preview('ErrorScreen');
        container.textContent!.should.contain('Something went wrong on our side');
        screen.getByRole('button', { name: 'Try again' });
        container.textContent!.should.contain('Support reference');
        container.textContent!.should.contain('ERR-7F3A-92C1');
    });

    it('should say nothing of a reference id the error screen does not have', () => {
        const { container } = preview('ErrorScreen', TemplatePreviewState.Empty);
        container.textContent!.should.not.contain('ERR-7F3A-92C1');
    });

    it('should bind only the sign-in screen and the error screen to the pack, and name those queries', () => {
        const queriesOf = (name: string) => elementsOf(Object.values(stateScreenTemplates.find(template => template.name === name)!.content ?? {}).flat())
            .flatMap(element => Object.values((element as { properties?: Record<string, unknown> }).properties ?? {}))
            .filter((value): value is { query: string } => typeof value === 'object' && value !== null && 'query' in value).map(value => value.query).sort();
        [queriesOf('LoginScreen'), queriesOf('NotFoundScreen'), queriesOf('ErrorScreen')].should.deep.equal([['FormErrors', 'SignInError', 'SignInSections', 'SignInValues'], [], ['SupportReference']]);
    });
});
