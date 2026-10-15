// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { ComponentState, componentStates, foundationSamples } from '../foundation';
import { foundationNames, renderFoundation, violationsIn } from './given';

// Spec Part B 1.4: loading (skeleton, not spinner-only), empty (explanation plus primary action), error (message plus retry),
// no-permission (explains what is missing, no data leaked), partial (some regions failed) - and Part B 6: all of them previewable.
describe('when rendering every foundation component in every standard state', () => {
    afterEach(cleanup);

    it('should have a sample for every foundation component', () => foundationNames.filter(name => !foundationSamples[name]).should.deep.equal([]));

    for (const name of foundationNames) {
        const sample = foundationSamples[name];

        for (const state of sample?.stateful ? componentStates : [ComponentState.Ready]) {
            it(`should leave ${name} without accessibility violations when ${state}`, async () => {
                const { container } = renderFoundation(name, undefined, state === ComponentState.Ready ? undefined : state);
                (await violationsIn(container)).should.deep.equal([]);
            });
        }

        if (!sample?.stateful) continue;

        const forced = (state: ComponentState, properties?: Record<string, unknown>) => renderFoundation(name, { ...sample.properties, ...properties }, state);

        it(`should draw ${name} with its data when ready`, () => {
            const { container } = forced(ComponentState.Ready);
            sample.data.forEach(text => container.textContent!.should.contain(text));
        });

        it(`should draw ${name} as a skeleton with an announced status while loading, with none of its data`, () => {
            const { container } = forced(ComponentState.Loading);
            container.querySelectorAll('.foundation-skeleton-block').length.should.be.greaterThan(0);
            screen.getByRole('status').textContent!.should.contain('Loading');
            (container.querySelector('[aria-busy="true"]') === null).should.equal(false);
            sample.data.forEach(text => container.textContent!.should.not.contain(text));
        });

        it(`should explain what ${name} is missing and offer the primary action when empty`, () => {
            const { container } = forced(ComponentState.Empty, { emptyHeadline: 'Nothing to show', emptyActionLabel: 'Add one' });
            container.querySelector('.foundation-empty-headline')!.textContent!.should.equal('Nothing to show');
            screen.getByRole('button', { name: 'Add one' });
        });

        it(`should show ${name} as a message with a retry when it failed`, () => {
            const { container } = forced(ComponentState.Error, { error: 'The server did not answer' });
            screen.getByRole('alert').textContent!.should.contain('The server did not answer');
            screen.getByRole('button', { name: 'Try again' });
            sample.data.forEach(text => container.textContent!.should.not.contain(text));
        });

        it(`should say what is missing and leak none of the data of ${name} when the user has no permission`, () => {
            const { container } = forced(ComponentState.NoPermission, { permissionSubject: 'the sales pipeline' });
            screen.getByRole('status').textContent!.should.contain('the sales pipeline');
            sample.data.forEach(text => container.textContent!.should.not.contain(text));
            container.querySelectorAll('button').length.should.equal(0);
        });

        it(`should keep the loaded part of ${name} and name what failed when only some regions did`, () => {
            const { container } = forced(ComponentState.Partial, { failedRegions: ['Deals by stage', 'My tasks'] });
            screen.getByRole('status').textContent!.should.contain('Deals by stage, My tasks');
            sample.data.forEach(text => container.textContent!.should.contain(text));
        });

        it(`should derive the state of ${name} from the properties a bound query publishes`, () => {
            const stateOf = (properties: Record<string, unknown>) => {
                const { container } = renderFoundation(name, { ...sample.properties, ...properties });
                const state = container.querySelector('[data-state]')!.getAttribute('data-state') ?? '';
                cleanup();
                return state;
            };

            stateOf({}).should.equal('ready');
            stateOf({ loading: true }).should.equal('loading');
            stateOf({ error: 'down' }).should.equal('error');
            stateOf({ forbidden: true }).should.equal('noPermission');
            stateOf({ failedRegions: ['x'] }).should.equal('partial');
        });
    }
});
