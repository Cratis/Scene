// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignTimeActionPlacement } from './DesignTimeActionPlacement';

/**
 * A package-provided design-time action that edits Scene model data through canonical edit batches.
 */
export interface DesignTimeActionDescriptor {
    /** Stable package-owned action identity. */
    id: string;

    /** The label a designer shows. */
    label: string;

    /** Where a designer may show the action. */
    placement?: DesignTimeActionPlacement;

    /** Owner-controlled visible/enabled rule name interpreted by the package's design-time bundle. */
    availability?: string;

    /** Help text for the designer. */
    description?: string;
}

export const DesignTimeActionDescriptorPropertyNames: (keyof DesignTimeActionDescriptor)[] = [
    'id', 'label', 'placement', 'availability', 'description',
];
