// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyValueType, type ComponentDescriptor, type PropertyDescriptor } from '@cratis/scene.model';
import { sampleOf } from '../Surface/DesignTime/designTimeSamples';
import { describeSampleValue } from './describeSampleValue';

// The group the content properties are shown under in the inspector.
export const contentGroup = 'Content';

// Whether a descriptor leaves the shape of what a property holds to a box of text: it says "any JSON" and names no editor for it.
const isUnshaped = (property: PropertyDescriptor): boolean => property.valueType === PropertyValueType.Json && property.editorKind === undefined;

// Adds a property to a component's descriptor for each piece of content the surface shows from a sample and the descriptor leaves out. A
// component shows its words, rows or items from properties; where nothing describes them the author sees content on the surface they cannot
// change. Each is described by the shape of its sample - a list of rows is a collection, a record an object - so it is edited by its
// fields and never as JSON text. A property the descriptor has is left as it is, except that one it only calls "any JSON" takes the
// shape of its sample, keeping the label, group and description the descriptor gave it. Nothing here is a default: an element that sets
// none still saves none.
export function withSampleContentProperties(descriptor: ComponentDescriptor): ComponentDescriptor {
    const sample = sampleOf(descriptor.component, descriptor.component.slice(descriptor.component.lastIndexOf(':') + 1));
    if (!sample) return descriptor;

    const existing = new Set(descriptor.properties.map(property => property.path));
    const reshaped = descriptor.properties.map(property => isUnshaped(property) && property.path in sample ? shapedLike(property, sample[property.path]) : property);
    const added: PropertyDescriptor[] = Object.entries(sample)
        .filter(([path]) => !existing.has(path))
        .map(([path, value]) => ({ ...describeSampleValue(path, value), description: 'Shown as sample content on the design surface until you set it.' }));

    const changed = added.length > 0 || reshaped.some((property, index) => property !== descriptor.properties[index]);
    return changed ? { ...descriptor, properties: [...reshaped, ...added] } : descriptor;
}

// The property as its sample describes it, with everything the descriptor itself said about it - label, group, description, constraints,
// bindings - kept.
function shapedLike(property: PropertyDescriptor, value: unknown): PropertyDescriptor {
    const { editorKind: _editorKind, item: _item, properties: _properties, choices: _choices, ...kept } = property;
    const described = describeSampleValue(property.path, value);
    return { ...described, ...kept, valueType: described.valueType };
}
