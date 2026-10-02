// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneEditKind } from './SceneEditKind';

/**
 * Removes what an instance set on an exposed property, so the inherited value applies again. For a collection it
 * removes every item the instance contributed.
 */
export interface ResetInstanceValueEdit {
    kind: SceneEditKind.ResetInstanceValue;
    instance?: string;
    component: string;
    path: string;
}

export const ResetInstanceValueEditPropertyNames: (keyof ResetInstanceValueEdit)[] = ['kind', 'instance', 'component', 'path'];
