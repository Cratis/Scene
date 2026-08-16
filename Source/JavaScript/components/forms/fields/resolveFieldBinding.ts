// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent } from '@cratis/scene.model';
import { stringProperty } from '../../properties';
import { FieldBinding } from './FieldBinding';

/**
 * Turns an element's `property` name into the {@link FieldBinding} a `@cratis/components` field takes,
 * or `undefined` when the screen never named a property.
 *
 * `undefined` rather than a default accessor, because a field bound to nothing is not a field with an
 * empty value - it is a field that would silently never read or write anything, and the screen author
 * needs to see that. The caller renders a placeholder instead.
 *
 * The label falls back to the property name, so a field is legible before anyone has written a `title`.
 */
export function resolveFieldBinding(element: ExternalComponent): FieldBinding | undefined {
    const property = stringProperty(element.properties, 'property');
    if (property === undefined) return undefined;

    return {
        value: (instance: Record<string, unknown>) => instance[property],
        title: stringProperty(element.properties, 'title') ?? property,
        description: stringProperty(element.properties, 'description'),
    };
}
