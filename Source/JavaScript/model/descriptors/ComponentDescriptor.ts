// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignTimeActionDescriptor } from './DesignTimeActionDescriptor';
import { PropertyDescriptor } from './PropertyDescriptor';

/**
 * What can be edited on one component a package provides.
 *
 * Packages contribute these alongside the components themselves (a bundle's `descriptors`), through the same
 * package mechanism that already carries components, layouts and themes - there is no second registry to keep in
 * step.
 */
export interface ComponentDescriptor {
    /**
     * The component this describes, as the package names it: `<package>:<bare name>`, the same key a bundle
     * registers the component under (for example `Cratis.Components:dataTable`).
     */
    component: string;

    /** A human-readable name for a palette or an inspector title. */
    displayName?: string;

    description?: string;

    /** Names a specialised editor for the component as a whole, when its properties are not edited one by one. */
    editorKind?: string;

    properties: PropertyDescriptor[];

    /** Package-provided design-time actions for this component. */
    actions?: DesignTimeActionDescriptor[];

    /** Names an optional package-provided preview renderer. */
    previewKind?: string;

    /** Names an optional package-provided property display renderer set. */
    propertyDisplayKind?: string;
}

export const ComponentDescriptorPropertyNames: (keyof ComponentDescriptor)[] = [
    'component', 'displayName', 'description', 'editorKind', 'properties', 'actions', 'previewKind', 'propertyDisplayKind',
];
