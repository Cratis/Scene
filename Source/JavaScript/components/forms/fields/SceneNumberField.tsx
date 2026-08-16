// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty, stringProperty } from '../../properties';
import { CommandFormField } from './CommandFormField';

const NumberField = lazy(async () => ({ default: (await import('@cratis/components/CommandForm')).NumberField }));

/**
 * The `Cratis.Components:numberField` component - `NumberField` from `@cratis/components/CommandForm`.
 *
 * PrimeReact's `InputNumber` behind the command binding, so the bound property stays a number rather
 * than the string an `<input type="number">` would hand back. `min`, `max` and `step` are client-side
 * affordances only - the authoritative check is still the backend's validation on the command.
 */
export function SceneNumberField({ element }: RegisteredComponentProps) {
    return (
        <CommandFormField element={element}>
            {binding => (
                <NumberField
                    {...binding}
                    placeholder={stringProperty(element.properties, 'placeholder')}
                    min={numberProperty(element.properties, 'min')}
                    max={numberProperty(element.properties, 'max')}
                    step={numberProperty(element.properties, 'step')}
                    className={stringProperty(element.properties, 'className')}
                />
            )}
        </CommandFormField>
    );
}
