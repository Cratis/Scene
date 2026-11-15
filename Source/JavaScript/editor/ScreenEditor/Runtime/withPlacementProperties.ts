// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyValueType, type ComponentDescriptor, type PropertyDescriptor } from '@cratis/scene.model';
import { canvasLeft, canvasTop } from '../PrototypeProjection/legacyPlacement';

// The group the placement properties are shown under in the inspector.
export const placementGroup = 'Placement';

const placement: PropertyDescriptor[] = [
    { path: canvasLeft, label: 'Left', group: placementGroup, valueType: PropertyValueType.Number },
    { path: canvasTop, label: 'Top', group: placementGroup, valueType: PropertyValueType.Number },
];

// Adds the canvas placement properties to a component's descriptor. A component does not know which panel it will be
// dropped on, so none of them declare where they sit; without this a component placed on a canvas could be seen but
// its position could not be edited through Scene's edits.
export function withPlacementProperties(descriptor: ComponentDescriptor): ComponentDescriptor {
    const existing = new Set(descriptor.properties.map(property => property.path));
    return { ...descriptor, properties: [...descriptor.properties, ...placement.filter(property => !existing.has(property.path))] };
}
