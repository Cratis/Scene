// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor, ComponentDesignModeDescriptor, componentIcon } from '@cratis/scene.model';
import { componentRegistryKey } from './ScenePackageBundle';

/**
 * What a package says about one of its components for a picker, besides what can be edited: the data of CMP1 and the picker's
 * rows. Written once per package as a table keyed by the bare component name.
 */
export interface ComponentMetadata {
    /** The name a picker shows. Absent keeps the one the component's descriptor has, or the bare name. */
    displayName?: string;

    /** One of `ComponentCategory`, or a category of the package's own. */
    category: string;

    /** The key of the icon in the built-in icon library (`componentIcon`). */
    icon?: string;

    /** Words the picker's filter matches besides the name. */
    keywords?: string[];

    /** An explicit two-letter badge; absent means derived from the name. */
    badge?: string;

    /** How the component is edited directly on the design surface. */
    designMode?: ComponentDesignModeDescriptor;
}

/** A `ComponentMetadata` entry in one line: what a package's metadata table is made of. */
export function componentMetadata(
    displayName: string,
    category: string,
    icon: string,
    keywords: string[] = [],
    badge?: string,
    designMode?: ComponentDesignModeDescriptor
): ComponentMetadata {
    return { displayName, category, icon, keywords, ...(badge === undefined ? {} : { badge }), ...(designMode === undefined ? {} : { designMode }) };
}

/**
 * Builds the descriptors a bundle ships: the ones written by hand with the package's component metadata merged in, plus a descriptor with
 * no editable properties for every component the metadata names that nobody described - such a component still has a name, a
 * category and a place in a picker. A hand-written descriptor keeps everything it already says; metadata only fills in what it
 * leaves out.
 *
 * The component list is the metadata table's own, so a component the table forgets has no descriptor and `validateComponentMetadata`
 * reports it (CMP1); one the table names but the manifest does not declare is reported by `validatePackageBundle`.
 */
export function describeComponents(
    packageName: string,
    described: readonly ComponentDescriptor[],
    metadata: Readonly<Record<string, ComponentMetadata>>
): ComponentDescriptor[] {
    const describedKeys = new Set(described.map(descriptor => descriptor.component));
    const bare = Object.keys(metadata)
        .map(name => componentRegistryKey(packageName, name))
        .filter(key => !describedKeys.has(key))
        .map((key): ComponentDescriptor => ({ component: key, properties: [] }));

    return [...described, ...bare].map(descriptor => withMetadata(descriptor, metadata[descriptor.component.slice(packageName.length + 1)]));
}

function withMetadata(descriptor: ComponentDescriptor, metadata: ComponentMetadata | undefined): ComponentDescriptor {
    if (!metadata) return descriptor;

    return {
        ...descriptor,
        displayName: descriptor.displayName ?? metadata.displayName ?? descriptor.component.slice(descriptor.component.indexOf(':') + 1),
        category: descriptor.category ?? metadata.category,
        ...(descriptor.icon === undefined && metadata.icon !== undefined ? { icon: componentIcon(metadata.icon) } : {}),
        ...(descriptor.keywords === undefined && metadata.keywords !== undefined ? { keywords: metadata.keywords } : {}),
        ...(descriptor.badge === undefined && metadata.badge !== undefined ? { badge: metadata.badge } : {}),
        ...(descriptor.designMode === undefined && metadata.designMode !== undefined ? { designMode: metadata.designMode } : {}),
    };
}
