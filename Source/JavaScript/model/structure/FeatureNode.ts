// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SliceNode } from './SliceNode';

/**
 * A feature in the application hierarchy; features nest.
 */
export interface FeatureNode {
    /** The feature identity, unique among its siblings; its qualified form is the dotted path from the module. */
    id: string;

    /** The display name. */
    name: string;

    /** The sub-features. */
    features: FeatureNode[];

    /** The slices that belong directly to this feature. */
    slices: SliceNode[];
}

export const FeatureNodePropertyNames: (keyof FeatureNode)[] = ['id', 'name', 'features', 'slices'];
