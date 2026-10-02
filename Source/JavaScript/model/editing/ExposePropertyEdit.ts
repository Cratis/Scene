// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExposedProperty } from '../exposure';
import { SceneEditKind } from './SceneEditKind';

/**
 * Exposes a property on a layout or template, or changes how it is exposed.
 */
export interface ExposePropertyEdit {
    kind: SceneEditKind.ExposeProperty;

    /** The layout or template making the declaration. */
    owner: string;
    property: ExposedProperty;
}

export const ExposePropertyEditPropertyNames: (keyof ExposePropertyEdit)[] = ['kind', 'owner', 'property'];
