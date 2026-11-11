// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { ExtensionComponentDefinition } from './ExtensionComponentDefinition';
import { ExtensionContext, ExtensionProperties, MountedInstance } from './ExtensionContext';
import { ExtensionContextProvider } from './react';

/**
 * Puts an extension component of either kind into a host element, giving both the same contract. A web host calls
 * this for every component placed on a screen, so the two kinds cannot be treated differently.
 *
 * A React component is rendered in its own React root inside an {@link ExtensionContextProvider}; hosts that render
 * React components in their own tree render the provider and the component directly instead.
 */
export function mountExtensionComponent(
    definition: ExtensionComponentDefinition,
    host: HTMLElement,
    properties: ExtensionProperties,
    context: ExtensionContext
): MountedInstance {
    if (definition.kind === 'mount') {
        return definition.mount(host, properties, context);
    }

    const root = createRoot(host);
    const render = (current: ExtensionProperties) =>
        root.render(createElement(ExtensionContextProvider, { context }, createElement(definition.component, current)));
    render(properties);
    return {
        update: render,
        unmount: () => root.unmount()
    };
}
