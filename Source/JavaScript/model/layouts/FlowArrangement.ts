// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Arrangement } from './Arrangement';
import { FlowNode } from './FlowNode';

/**
 * Arranges a slot's content by reflowing it with the neutral `flow` primitives ({@link FlowRow},
 * {@link FlowColumn}, {@link FlowGrid}, {@link FlowLeaf}), recomputed against the current size class
 * rather than fixed per breakpoint. Deliberately not CSS-flavored — a renderer maps these primitives to
 * whatever native layout mechanism it has (flexbox/grid in `Scene.React`, something else in a future
 * native renderer).
 */
export interface FlowArrangement extends Arrangement {
    root: FlowNode;
}

export const FlowArrangementPropertyNames: (keyof FlowArrangement)[] = ['root'];
