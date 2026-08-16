// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FlowContainerKind } from './FlowContainerKind';
import { FlowNode } from './FlowNode';

/**
 * A {@link FlowNode} that arranges child nodes ({@link FlowRow}, {@link FlowColumn} or {@link FlowGrid}).
 */
export interface FlowContainer extends FlowNode {
    gap: number;
    children: FlowNode[];

    /**
     * Which way this container arranges its children. Narrowed to a single member by each concrete
     * container, which is what makes them a discriminated union rather than three identical shapes.
     */
    kind: FlowContainerKind;
}

export const FlowContainerPropertyNames: (keyof FlowContainer)[] = ['gap', 'children', 'kind'];
