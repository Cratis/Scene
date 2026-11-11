// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ComponentType } from 'react';
import { ExtensionPlatform, MountFactory, webPlatform } from './ExtensionContext';

/** The kinds of extension component a package manifest can declare. */
export type ExtensionComponentKind = 'react' | 'mount' | 'screenplay';

/** A React component. It is rendered in the host's own React tree and reads the context through the `use*` hooks. */
export interface ReactExtensionComponent {
    readonly kind: 'react';

    /** The component, taking the contract's properties. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- a component's props are checked against the contract, not here
    readonly component: ComponentType<any>;

    /** The platforms it supports: always only the web. */
    readonly platforms: readonly ExtensionPlatform[];
}

/** A framework-neutral component. */
export interface MountExtensionComponent {
    readonly kind: 'mount';

    /** The factory that draws into a host element. */
    readonly mount: MountFactory;

    /** The platforms the factory supports. */
    readonly platforms: readonly ExtensionPlatform[];
}

/** What an extension frontend registers for one component name. */
export type ExtensionComponentDefinition = ReactExtensionComponent | MountExtensionComponent;

/** Defines a React extension component. React is web-only. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- a component's props are checked against the contract, not here
export function reactComponent(component: ComponentType<any>): ReactExtensionComponent {
    return { kind: 'react', component, platforms: [webPlatform] };
}

/** Defines a mount extension component, declaring the platforms it supports (the web by default). */
export function mountComponent(mount: MountFactory, platforms: readonly ExtensionPlatform[] = [webPlatform]): MountExtensionComponent {
    if (platforms.length === 0) {
        throw new Error('A mount component must support at least one platform.');
    }
    return { kind: 'mount', mount, platforms };
}

/** What an extension frontend module exports: its components by the name the contract declares. */
export type ExtensionFrontendModule = Readonly<Record<string, ExtensionComponentDefinition>>;
