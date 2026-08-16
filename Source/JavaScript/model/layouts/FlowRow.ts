// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FlowContainer } from './FlowContainer';
import { FlowContainerKind } from './FlowContainerKind';

/**
 * A {@link FlowContainer} that arranges its children horizontally.
 */
export interface FlowRow extends FlowContainer {
    kind: FlowContainerKind.Row;
}

export const FlowRowPropertyNames: (keyof FlowRow)[] = ['kind'];
