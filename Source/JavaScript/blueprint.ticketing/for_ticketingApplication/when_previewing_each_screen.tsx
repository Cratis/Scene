// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, within } from '@testing-library/react';
import { afterEach, beforeAll } from 'vitest';
import { ComponentState } from '@cratis/scene.blueprint.default';
import { ticketingComposition, ticketingScreenDefinitions } from '../index';
import { ForcedState, english, forceState, german, preview, provideBrowserApis, violationsIn } from './given';


const screenOnPage = () => document.querySelector('[data-scene-outlet="primary"]')!.getAttribute('data-scene-screen');

// Spec Part B 6: "standard states previewable via sample data" and "keyboard and screen-reader pass". Every ready-to-use screen is booted through the real
// application host - the shell, the navigation, the template chain - once for each sample-data pack the blueprint ships.
describe('when previewing each screen of the help desk blueprint', () => {
    beforeAll(provideBrowserApis);
    afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

    for (const pack of [english, german]) {
        for (const screen of ticketingScreenDefinitions) {
            it(`should show ${screen.name} with the ${pack.id} data, unresolved nowhere and without an accessibility violation`, async () => {
                const { container } = render(preview(screen.name, pack));
                screenOnPage()!.should.equal(screen.name);
                container.textContent!.should.not.contain('Unresolved');
                (container.querySelector('.foundation, [data-scene-id]') === null).should.equal(false);
                (await violationsIn(container)).should.deep.equal([]);
            });
        }
    }

    it('should draw the same screen with each pack\'s own rows and no row of the other', () => {
        const inEnglish = render(preview('support.queue', english));
        inEnglish.container.textContent!.should.contain('Cannot sign in after password reset').and.not.contain('Anmeldung nach Passwort-Reset');
        cleanup();
        const inGerman = render(preview('support.queue', german));
        inGerman.container.textContent!.should.contain('Anmeldung nach Passwort-Reset').and.not.contain('Cannot sign in after password reset');
    });

    describe('and a standard state is forced on every region (Part B 1.4)', () => {
        const forced = (screen: string, state: ForcedState) =>
            render(preview(screen, english, { composition: { ...ticketingComposition, decorate: element => forceState(element, state) } }));
        const regionText = (container: HTMLElement) => Array.from(container.querySelectorAll('.foundation')).map(region => region.textContent ?? '').join(' ');

        for (const screen of ['support.dashboard', 'support.queue', 'support.queue.board', 'support.queue.ticket', 'support.queue.new', 'support.customers', 'support.knowledge']) {
            it(`should show ${screen} loading with an announced skeleton and none of its data`, () => {
                const { container } = forced(screen, { state: ComponentState.Loading });
                container.querySelectorAll('.foundation-skeleton').length.should.be.greaterThan(0);
                regionText(container).should.not.contain('Isla Morgan').and.not.contain('Northgate Logistics');
            });

            it(`should show ${screen} with a message and a retry when it failed`, () => {
                const { container } = forced(screen, { state: ComponentState.Error, error: 'The server did not answer' });
                within(container).getAllByRole('alert').length.should.be.greaterThan(0);
                within(container).getAllByRole('button', { name: 'Try again' }).length.should.be.greaterThan(0);
                regionText(container).should.not.contain('Isla Morgan');
            });

            it(`should show ${screen} saying what is missing and leaking no data without permission`, () => {
                const { container } = forced(screen, { state: ComponentState.NoPermission, permissionSubject: 'the support data' });
                container.textContent!.should.contain('the support data');
                regionText(container).should.not.contain('Isla Morgan').and.not.contain('Northgate Logistics');
            });

            it(`should show ${screen} keeping its chrome and naming what failed when it is partial`, () => {
                const { container } = forced(screen, { state: ComponentState.Partial, failedRegions: ['Tickets'] });
                container.querySelectorAll('[data-state="partial"]').length.should.be.greaterThan(0);
            });

            it(`should leave ${screen} without an accessibility violation in each forced state`, async () => {
                for (const state of [ComponentState.Loading, ComponentState.Error, ComponentState.NoPermission, ComponentState.Partial]) {
                    const { container } = forced(screen, { state, error: 'The server did not answer', permissionSubject: 'the support data', failedRegions: ['Tickets'] });
                    (await violationsIn(container)).should.deep.equal([]);
                    cleanup();
                }
            });
        }
    });
});
