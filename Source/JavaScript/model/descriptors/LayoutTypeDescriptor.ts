// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LayoutCapabilities } from './LayoutCapabilities';
import { LayoutType } from './LayoutType';
import { PropertyDescriptor } from './PropertyDescriptor';

/**
 * What can be edited on one layout type, and what the type can do.
 */
export interface LayoutTypeDescriptor {
    /** The layout type's identity. */
    type: LayoutType;

    label: string;
    description?: string;
    capabilities: LayoutCapabilities;

    /** The type's own editable properties; `path` is a property name on the node. */
    properties: PropertyDescriptor[];
}

export const LayoutTypeDescriptorPropertyNames: (keyof LayoutTypeDescriptor)[] = [
    'type', 'label', 'description', 'capabilities', 'properties',
];
