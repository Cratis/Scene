// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { InspectedProperty } from '@cratis/scene.model';
import { canvasLeft, canvasTop } from '../PrototypeProjection/legacyPlacement';

const placementPaths = new Set([canvasLeft, canvasTop]);

// The properties worth showing for an element. Left and Top place an element on a canvas and do nothing anywhere else, so they are shown only
// when the element is held by a canvas - or already has a position, which should be seen so it can be removed.
export function visibleProperties(properties: InspectedProperty[], inCanvas: boolean, placed: Record<string, unknown> | undefined): InspectedProperty[] {
    if (inCanvas) return properties;
    return properties.filter(property => !placementPaths.has(property.descriptor.path) || placed?.[property.descriptor.path] !== undefined);
}
