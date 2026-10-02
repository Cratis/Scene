// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneEditKind } from './SceneEditKind';

/**
 * Removes a property's stored value, so the descriptor's default applies again.
 */
export interface ResetPropertyEdit {
    kind: SceneEditKind.ResetProperty;
    nodeId: string;
    path: string;
}

export const ResetPropertyEditPropertyNames: (keyof ResetPropertyEdit)[] = ['kind', 'nodeId', 'path'];
