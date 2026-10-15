// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FeatureNode } from './FeatureNode';
import { SliceNode } from './SliceNode';

/**
 * A module in the application hierarchy.
 */
export interface ModuleNode {
    /** The module identity, unique in the application; the first segment of every qualified id below it. */
    id: string;

    /** The display name. */
    name: string;

    /** The module's top-level features, first feature first. */
    features: FeatureNode[];

    /** The slices that belong directly to the module, when it has any. */
    slices?: SliceNode[];
}

export const ModuleNodePropertyNames: (keyof ModuleNode)[] = ['id', 'name', 'features', 'slices'];
