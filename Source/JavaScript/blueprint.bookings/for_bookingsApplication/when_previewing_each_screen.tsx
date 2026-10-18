// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, within } from '@testing-library/react';
import { afterEach, beforeAll } from 'vitest';
import { ComponentState } from '@cratis/scene.blueprint.default';
import { bookingsComposition, bookingsScreenDefinitions } from '../index';
import { ForcedState, tracker, forceState, preview, provideBrowserApis, violationsIn } from './given';


const screenOnPage = () => document.querySelector('[data-scene-outlet="primary"]')!.getAttribute('data-scene-screen');

// Spec Part B 6: "standard states previewable via sample data" and "keyboard and screen-reader pass". Every ready-to-use screen is booted through the real
// application host - the shell, the navigation, the template chain - once for each sample-data pack the blueprint ships.
describe('when previewing each screen of the Bookings blueprint', () => {
    beforeAll(provideBrowserApis);
    afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

    for (const pack of [tracker]) {
        for (const screen of bookingsScreenDefinitions) {
            it(`should show ${screen.name} with the ${pack.id} data, unresolved nowhere and without an accessibility violation`, async () => {
                const { container } = render(preview(screen.name, pack));
                screenOnPage()!.should.equal(screen.name);
                container.textContent!.should.not.contain('Unresolved');
                (container.querySelector('.foundation, [data-scene-id]') === null).should.equal(false);
                (await violationsIn(container)).should.deep.equal([]);
            });
        }
    }
    describe('and a standard state is forced on every region (Part B 1.4)', () => {
        const forced = (screen: string, state: ForcedState) =>
            render(preview(screen, tracker, { composition: { ...bookingsComposition, decorate: element => forceState(element, state) } }));
        const regionText = (container: HTMLElement) => Array.from(container.querySelectorAll('.foundation')).map(region => region.textContent ?? '').join(' ');

        for (const screen of ['bookings.calendar', 'bookings.list', 'bookings.record', 'bookings.resources', 'bookings.new']) {
            it(`should show ${screen} loading with an announced skeleton and none of its data`, () => {
                const { container } = forced(screen, { state: ComponentState.Loading });
                container.querySelectorAll('.foundation-skeleton').length.should.be.greaterThan(0);
                regionText(container).should.not.contain('BK-4410');
            });

            it(`should show ${screen} with a message and a retry when it failed`, () => {
                const { container } = forced(screen, { state: ComponentState.Error, error: 'The server did not answer' });
                within(container).getAllByRole('alert').length.should.be.greaterThan(0);
                within(container).getAllByRole('button', { name: 'Try again' }).length.should.be.greaterThan(0);
                regionText(container).should.not.contain('BK-4410');
            });

            it(`should show ${screen} saying what is missing and leaking no data without permission`, () => {
                const { container } = forced(screen, { state: ComponentState.NoPermission, permissionSubject: 'the bookings data' });
                container.textContent!.should.contain('the bookings data');
                regionText(container).should.not.contain('BK-4410');
            });

            it(`should show ${screen} keeping its chrome and naming what failed when it is partial`, () => {
                const { container } = forced(screen, { state: ComponentState.Partial, failedRegions: ['Attendees'] });
                container.querySelectorAll('[data-state="partial"]').length.should.be.greaterThan(0);
            });

            it(`should leave ${screen} without an accessibility violation in each forced state`, async () => {
                for (const state of [ComponentState.Loading, ComponentState.Error, ComponentState.NoPermission, ComponentState.Partial]) {
                    const { container } = forced(screen, { state, error: 'The server did not answer', permissionSubject: 'the bookings data', failedRegions: ['Attendees'] });
                    (await violationsIn(container)).should.deep.equal([]);
                    cleanup();
                }
            });
        }
    });
});
