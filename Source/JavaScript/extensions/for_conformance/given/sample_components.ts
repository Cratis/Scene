// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { ExtensionComponentDefinition, mountComponent, reactComponent } from '../../index';
import { useLocale, useUser } from '../../index';
import { ExtensionConformanceSubject } from '../../conformance';

function GreetingView({ label }: { label: string }) {
    const user = useUser();
    const locale = useLocale();
    return createElement('p', null, `${label}|${user.name}|${locale.language}`);
}

const mountedGreeting = mountComponent((host, properties, context) => {
    const paragraph = host.ownerDocument.createElement('p');
    let label = String(properties.label);
    const render = () => { paragraph.textContent = `${label}|${context.user.name}|${context.locale.language}`; };
    host.appendChild(paragraph);
    render();
    const unsubscribe = context.subscribe(render);
    return {
        update: next => { label = String(next.label); render(); },
        unmount: () => { unsubscribe(); paragraph.remove(); }
    };
});

export const sampleReactGreeting: ExtensionComponentDefinition = reactComponent(GreetingView);
export const sampleMountGreeting: ExtensionComponentDefinition = mountedGreeting;

const subjectFor = (name: string, definition: ExtensionComponentDefinition): ExtensionConformanceSubject => ({
    name,
    definition,
    properties: { label: 'Hello' },
    updatedProperties: { label: 'Welcome' },
    verify: (host, expected) => {
        const actual = host.textContent;
        const wanted = `${expected.properties.label}|${expected.user.name}|${expected.locale.language}`;
        if (actual !== wanted) {
            throw new Error(`Expected '${wanted}' but the host shows '${actual}'.`);
        }
    }
});

export const reactGreetingSubject = subjectFor('sample React greeting', sampleReactGreeting);
export const mountGreetingSubject = subjectFor('sample mount greeting', sampleMountGreeting);
