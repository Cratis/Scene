// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Arrangement } from './Arrangement';
import { FlowNode } from './FlowNode';
import { FlowOverride } from './FlowOverride';

/**
 * Arranges a slot's content by reflowing it with the neutral `flow` primitives ({@link FlowRow},
 * {@link FlowColumn}, {@link FlowGrid}, {@link FlowLeaf}), recomputed against the current size class
 * rather than fixed per breakpoint. Deliberately not CSS-flavored — a renderer maps these primitives to
 * whatever native layout mechanism it has (flexbox/grid in `Scene.React`, something else in a future
 * native renderer).
 */
export interface FlowArrangement extends Arrangement {
    root: FlowNode;

    /**
     * Replacements for `root` targeting specific width/height size classes - the most specific match
     * wins (both dimensions targeted beats one), and the last declared wins among equally specific
     * matches. `undefined` or empty when the tree never varies by size class.
     */
    overrides?: FlowOverride[];
}

export const FlowArrangementPropertyNames: (keyof FlowArrangement)[] = ['root', 'overrides'];
