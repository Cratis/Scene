// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExtensionComponentKind } from './ExtensionComponentDefinition';
import { ExtensionPlatform } from './ExtensionContext';

/** A typed value the contract declares: a component property, or a value a signal carries. */
export interface ExtensionValueManifest {
    /** The name. */
    name: string;

    /** The contract's type for it, for example `Money` or `String`. */
    type: string;
}

/** A signal a component raises, with the values it carries. */
export interface ExtensionSignalManifest {
    /** The signal's name, handled on a screen with `on <signal>`. */
    name: string;

    /** The values the signal carries. */
    values: ExtensionValueManifest[];
}

/** The frontend part of the contract for one component, matching the `component` block of the `contract.play` file. */
export interface ExtensionComponentManifest {
    /** The component's name within the extension. */
    name: string;

    /** Which kind of component it is. */
    kind: ExtensionComponentKind;

    /** The platforms it supports. React components support only `web`. */
    platforms: ExtensionPlatform[];

    /** The package file shown while the component loads, if it declares one. */
    placeholder?: string;

    /** The typed properties the component takes. */
    properties: ExtensionValueManifest[];

    /** The signals the component raises. */
    raises: ExtensionSignalManifest[];
}

/** The frontend part of an extension's manifest. */
export interface ExtensionFrontendManifest {
    /** The extension's name, which screens use as the system's contract name. */
    name: string;

    /** The extension's components. */
    components: ExtensionComponentManifest[];
}

/** Finds a component in a manifest by name. */
export function findExtensionComponent(manifest: ExtensionFrontendManifest, name: string): ExtensionComponentManifest | undefined {
    return manifest.components.find(component => component.name === name);
}

/** Whether a component supports a platform. */
export function supportsPlatform(component: ExtensionComponentManifest, platform: ExtensionPlatform): boolean {
    return component.platforms.includes(platform);
}

/**
 * Checks a manifest against the contract's own rules and answers every problem found, empty when it is sound:
 * unique component names, at least one platform, and web-only React components.
 */
export function validateFrontendManifest(manifest: ExtensionFrontendManifest): string[] {
    const problems: string[] = [];
    const seen = new Set<string>();
    for (const component of manifest.components) {
        if (seen.has(component.name)) {
            problems.push(`Component '${component.name}' is declared more than once.`);
        }
        seen.add(component.name);
        if (component.platforms.length === 0) {
            problems.push(`Component '${component.name}' declares no platform.`);
        }
        if (component.kind === 'react' && component.platforms.some(platform => platform !== 'web')) {
            problems.push(`Component '${component.name}' is React, which is web-only.`);
        }
    }
    return problems;
}
