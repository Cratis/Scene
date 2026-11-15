// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditTarget, SceneEditKind, type InspectedProperty, type SceneEdit } from '@cratis/scene.model';
import { elementNodeId } from '@cratis/scene.engine';

// Whether a value the control reports is a number typed as text (an empty field means "back to the default").
const coerce = (property: InspectedProperty, value: unknown): unknown =>
    property.descriptor.valueType === 'number' && typeof value === 'string' ? (value.trim() === '' ? undefined : Number(value)) : value;

// The Scene edit that sets a property from an inspection. A property an inherited template exposes is set on this
// scope's instance of the template; any other is set on the node itself. Which one is Scene's call, reported as the
// property's `editTarget` - the editor never decides it.
export function editForValue(elementId: string, property: InspectedProperty, value: unknown): SceneEdit {
    const coerced = coerce(property, value);
    if (property.editTarget === EditTarget.Instance) {
        return coerced === undefined
            ? { kind: SceneEditKind.ResetInstanceValue, component: elementId, path: property.descriptor.path }
            : { kind: SceneEditKind.SetInstanceValue, component: elementId, path: property.descriptor.path, value: coerced };
    }

    return coerced === undefined
        ? { kind: SceneEditKind.ResetProperty, nodeId: elementNodeId(elementId), path: property.descriptor.path }
        : { kind: SceneEditKind.SetProperty, nodeId: elementNodeId(elementId), path: property.descriptor.path, value: coerced };
}

// The edit for one field of one item of a collection property (a navigation item's label, an argument's source).
export function editForCollectionField(elementId: string, property: InspectedProperty, itemId: string, field: string, value: unknown): SceneEdit {
    return { kind: SceneEditKind.EditCollectionItem, component: elementId, path: property.descriptor.path, itemId, field, value };
}
