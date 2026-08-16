// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:floatLabel` component - a label that starts inside its field and floats above it once
 * the field has focus or a value.
 *
 * FloatLabel is a wrapper, not a field, so the field it decorates comes from the `content` slot. An
 * empty slot falls back to a plain text input rather than rendering a label attached to nothing, which
 * would look like a styling bug rather than a missing child.
 */
export function PrimeFloatLabel({ element, slots }: RegisteredComponentProps) {
    const label = stringProperty(element, 'label', 'Label');
    return (
        <FloatLabel data-scene-id={element.id}>
            {slots.content?.length ? slots.content : <InputText id={element.id} />}
            <label htmlFor={element.id}>{label}</label>
        </FloatLabel>
    );
}
