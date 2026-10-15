// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SliceKind } from './SliceKind';

/**
 * A slice in the application hierarchy.
 */
export interface SliceNode {
    /** The slice identity, unique among the siblings of its feature or module; its qualified form is `module.feature.Slice`. */
    id: string;

    /** The display name. */
    name: string;

    /** Whether the slice is a state change, a state view or an automation. */
    kind: SliceKind;
}

export const SliceNodePropertyNames: (keyof SliceNode)[] = ['id', 'name', 'kind'];
