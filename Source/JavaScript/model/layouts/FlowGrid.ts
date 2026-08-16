// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FlowContainer } from './FlowContainer';
import { FlowContainerKind } from './FlowContainerKind';

/**
 * A {@link FlowContainer} that arranges its children in a grid.
 */
export interface FlowGrid extends FlowContainer {
    kind: FlowContainerKind.Grid;
    columns?: number;
    rows?: number;
}

export const FlowGridPropertyNames: (keyof FlowGrid)[] = ['kind', 'columns', 'rows'];
