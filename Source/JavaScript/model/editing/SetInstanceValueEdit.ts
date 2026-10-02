// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneEditKind } from './SceneEditKind';

/**
 * Sets an exposed scalar property from a template instance.
 */
export interface SetInstanceValueEdit {
    kind: SceneEditKind.SetInstanceValue;

    /** The instance contributing; defaults to the editing scope's own instance. */
    instance?: string;
    component: string;
    path: string;
    value: unknown;
}

export const SetInstanceValueEditPropertyNames: (keyof SetInstanceValueEdit)[] = ['kind', 'instance', 'component', 'path', 'value'];
