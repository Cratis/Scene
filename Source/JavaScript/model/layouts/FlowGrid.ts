// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FlowContainer } from './FlowContainer';

/**
 * A {@link FlowContainer} that arranges its children in a grid.
 */
export interface FlowGrid extends FlowContainer {
    columns?: number;
    rows?: number;
}

export const FlowGridPropertyNames: (keyof FlowGrid)[] = ['columns', 'rows'];
