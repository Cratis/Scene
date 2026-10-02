// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LayoutType } from '../descriptors';
import { SceneEditKind } from './SceneEditKind';

/**
 * Changes a layout node into another layout type, keeping its children.
 */
export interface ChangeLayoutTypeEdit {
    kind: SceneEditKind.ChangeLayoutType;
    nodeId: string;
    to: `${LayoutType}`;

    /**
     * Whether the author has seen what the conversion drops and accepts it. Without it a lossy conversion is
     * refused with a diagnostic naming what would be lost.
     */
    acceptLoss?: boolean;
}

export const ChangeLayoutTypeEditPropertyNames: (keyof ChangeLayoutTypeEdit)[] = ['kind', 'nodeId', 'to', 'acceptLoss'];
