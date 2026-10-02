// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EffectivePropertyValue } from './EffectivePropertyValue';

/**
 * The resolved configuration of one component: the full property bag a renderer should use, and a record per
 * exposed property of where it came from.
 */
export interface EffectiveComponentConfiguration {
    /** The id of the element. */
    component: string;

    /** The name of the layout or template that owns the element. */
    owner: string;

    /** The element's `properties` with every valid contribution applied. */
    properties: Record<string, unknown>;

    /** One entry per exposed property. */
    values: EffectivePropertyValue[];
}

export const EffectiveComponentConfigurationPropertyNames: (keyof EffectiveComponentConfiguration)[] = [
    'component', 'owner', 'properties', 'values',
];
