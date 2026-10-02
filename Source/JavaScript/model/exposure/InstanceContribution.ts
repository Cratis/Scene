// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ContributedItem } from './ContributedItem';

/**
 * What one template instance sets on one exposed property.
 *
 * Contributions are kept apart from the template they configure - a screen filling a template stores its own
 * values here and never a copy of the template tree, so changing the template reaches every instance. They are
 * keyed by instance, component and property path; collection items by their own id.
 *
 * A scalar property carries `value`; a collection carries `items`, which are appended after the owner's own items
 * in the order given.
 */
export interface InstanceContribution {
    /**
     * The instance contributing: `screen:<name>` for a screen filling a template, `template:<name>` for a
     * template sitting inside another template's slot, `dialog:<name>` for a dialog.
     */
    instance: string;

    /** The id of the element the property belongs to. */
    component: string;

    /** The property's path. */
    path: string;

    /** The value of a scalar property. */
    value?: unknown;

    /** The items a collection property gets from this instance, in order. */
    items?: ContributedItem[];
}

export const InstanceContributionPropertyNames: (keyof InstanceContribution)[] = ['instance', 'component', 'path', 'value', 'items'];
