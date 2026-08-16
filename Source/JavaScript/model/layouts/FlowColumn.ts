// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FlowContainer } from './FlowContainer';
import { FlowContainerKind } from './FlowContainerKind';

/**
 * A {@link FlowContainer} that arranges its children vertically.
 */
export interface FlowColumn extends FlowContainer {
    kind: FlowContainerKind.Column;
}

export const FlowColumnPropertyNames: (keyof FlowColumn)[] = ['kind'];
