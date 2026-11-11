// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createExtensionConformanceChecks, mountComponent } from '../index';
import { mountGreetingSubject, reactGreetingSubject } from './given/sample_components';

const messageOf = (run: () => Promise<void>) => run().then(() => 'passed', (error: Error) => error.message);

describe('when running the conformance kit', () => {
    for (const subject of [reactGreetingSubject, mountGreetingSubject]) {
        describe(`against the ${subject.name}`, () => {
            for (const check of createExtensionConformanceChecks(subject)) {
                it(`should ${check.name}`, check.run);
            }
        });
    }

    describe('against a mount component that never unsubscribes or clears its host', () => {
        const leaking = {
            ...mountGreetingSubject,
            name: 'leaking component',
            definition: mountComponent((host, properties, context) => {
                const paragraph = host.ownerDocument.createElement('p');
                const render = () => { paragraph.textContent = `${properties.label}|${context.user.name}|${context.locale.language}`; };
                host.appendChild(paragraph);
                render();
                context.subscribe(render);
                return { update: () => undefined, unmount: () => undefined };
            })
        };
        const checks = createExtensionConformanceChecks(leaking);
        const named = (fragment: string) => checks.find(check => check.name.includes(fragment))!;

        it('should fail the check that it cleans up its host', () => messageOf(named('removes what it rendered').run).then(message => message.should.match(/left 1 node/)));
        it('should fail the check that it releases its subscriptions', () => messageOf(named('releases every subscription').run).then(message => message.should.match(/subscription/)));
        it('should fail the check that it shows new property values', () => messageOf(named('new property values').run).then(message => message.should.match(/Expected/)));
    });
});
