// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act } from 'react';
import { ExtensionComponentDefinition } from './ExtensionComponentDefinition';
import { ExtensionLocale, ExtensionProperties, ExtensionUser } from './ExtensionContext';
import { createExtensionContext, ExtensionContextController } from './createExtensionContext';
import { mountExtensionComponent } from './mountExtensionComponent';

/** What the conformance kit needs to know to exercise one component. */
export interface ExtensionConformanceSubject {
    /** A name for reports. */
    name: string;

    /** The component, of either kind. */
    definition: ExtensionComponentDefinition;

    /** The properties it is first mounted with. */
    properties: ExtensionProperties;

    /** Different properties it must re-render with. */
    updatedProperties: ExtensionProperties;

    /**
     * Throws when the host element does not show what the component should show for these properties, the user and the
     * locale. The component under test must display its properties and the user's name and language somewhere.
     */
    verify(host: HTMLElement, expected: { properties: ExtensionProperties; user: ExtensionUser; locale: ExtensionLocale }): void;
}

/** One named expectation of the contract. */
export interface ExtensionConformanceCheck {
    /** What the contract expects, as a sentence. */
    readonly name: string;

    /** Runs the expectation, throwing when the component does not meet it. */
    run(): Promise<void>;
}

const firstUser: ExtensionUser = { id: 'user-1', name: 'Ada', roles: ['reader'], signedIn: true };
const secondUser: ExtensionUser = { id: 'user-2', name: 'Grace', roles: ['editor'], signedIn: true };
const firstLocale: ExtensionLocale = { language: 'en', availableLanguages: ['en', 'nb'], timeZone: 'UTC' };
const secondLocale: ExtensionLocale = { language: 'nb', availableLanguages: ['en', 'nb'], timeZone: 'Europe/Oslo' };

/**
 * The expectations every extension component meets, whatever its kind. The same checks run for a React component and
 * a mount component, so the two paths cannot drift. Framework-neutral: wire each check into your runner with
 * `it(check.name, check.run)`. Needs a DOM.
 */
export function createExtensionConformanceChecks(subject: ExtensionConformanceSubject): ExtensionConformanceCheck[] {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

    const expectation = (properties: ExtensionProperties, user: ExtensionUser, locale: ExtensionLocale) => ({ properties, user, locale });

    const withComponent = async (body: (host: HTMLElement, controller: ExtensionContextController, instance: ReturnType<typeof mountExtensionComponent>) => Promise<void> | void) => {
        const host = document.createElement('div');
        document.body.appendChild(host);
        const controller = createExtensionContext({ user: firstUser, locale: firstLocale });
        let instance!: ReturnType<typeof mountExtensionComponent>;
        await act(async () => { instance = mountExtensionComponent(subject.definition, host, subject.properties, controller.context); });
        try {
            await body(host, controller, instance);
        } finally {
            await act(async () => { instance.unmount(); });
            host.remove();
        }
    };

    const fail = (message: string): never => { throw new Error(`${subject.name}: ${message}`); };

    return [
        {
            name: 'declares at least one platform, and a React component only the web',
            run: async () => {
                if (subject.definition.platforms.length === 0) { fail('declares no platform.'); }
                if (subject.definition.kind === 'react' && subject.definition.platforms.some(platform => platform !== 'web')) {
                    fail('is React, which is web-only, but declares another platform.');
                }
            }
        },
        {
            name: 'shows its properties, the user and the locale after mounting',
            run: () => withComponent(host => subject.verify(host, expectation(subject.properties, firstUser, firstLocale)))
        },
        {
            name: 'shows new property values after an update',
            run: () => withComponent(async (host, _controller, instance) => {
                await act(async () => { instance.update(subject.updatedProperties); });
                subject.verify(host, expectation(subject.updatedProperties, firstUser, firstLocale));
            })
        },
        {
            name: 'follows the user and the locale when the context changes',
            run: () => withComponent(async (host, controller) => {
                await act(async () => { controller.update({ user: secondUser, locale: secondLocale }); });
                subject.verify(host, expectation(subject.properties, secondUser, secondLocale));
            })
        },
        {
            name: 'removes what it rendered when unmounted',
            run: async () => {
                const host = document.createElement('div');
                document.body.appendChild(host);
                const controller = createExtensionContext({ user: firstUser, locale: firstLocale });
                let instance!: ReturnType<typeof mountExtensionComponent>;
                await act(async () => { instance = mountExtensionComponent(subject.definition, host, subject.properties, controller.context); });
                await act(async () => { instance.unmount(); });
                const leftover = host.childNodes.length;
                host.remove();
                if (leftover > 0) { fail(`left ${leftover} node(s) in its host after unmount.`); }
            }
        },
        {
            name: 'releases every subscription when unmounted',
            run: async () => {
                const host = document.createElement('div');
                document.body.appendChild(host);
                const controller = createExtensionContext({ user: firstUser, locale: firstLocale });
                let instance!: ReturnType<typeof mountExtensionComponent>;
                await act(async () => { instance = mountExtensionComponent(subject.definition, host, subject.properties, controller.context); });
                await act(async () => { instance.unmount(); });
                const open = controller.subscriberCount;
                host.remove();
                if (open > 0) { fail(`left ${open} subscription(s) open after unmount.`); }
            }
        }
    ];
}
