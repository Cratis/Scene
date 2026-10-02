// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneEditKind } from './SceneEditKind';

/**
 * Withdraws an exposure. Values instances already saved against it are kept, and come back if it is exposed again.
 */
export interface UnexposePropertyEdit {
    kind: SceneEditKind.UnexposeProperty;
    owner: string;
    component: string;
    path: string;
}

export const UnexposePropertyEditPropertyNames: (keyof UnexposePropertyEdit)[] = ['kind', 'owner', 'component', 'path'];
