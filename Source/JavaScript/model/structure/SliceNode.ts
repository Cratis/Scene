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

    /** The command a state change slice accepts; the slice `id` when absent. */
    command?: string;

    /** The dialog template the slice opens as a task dialog; the host's default form dialog when absent. */
    dialogTemplate?: string;
}

export const SliceNodePropertyNames: (keyof SliceNode)[] = ['id', 'name', 'kind', 'command', 'dialogTemplate'];
