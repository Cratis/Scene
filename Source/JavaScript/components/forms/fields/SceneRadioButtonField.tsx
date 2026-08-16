// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty, stringProperty } from '../../properties';
import { CommandFormField } from './CommandFormField';

const RadioButtonField = lazy(async () => ({ default: (await import('@cratis/components/CommandForm')).RadioButtonField }));

/**
 * The `Cratis.Components:radioButtonField` component - `RadioButtonField` from
 * `@cratis/components/CommandForm`.
 *
 * One button of a mutually exclusive set, for a screen that needs the choices placed individually rather
 * than as a block. `buttonValue` is the value this particular button writes to the bound property, and
 * the whole set is tied together by every button naming the same `property`.
 *
 * `buttonValue` is read as a string first and a number second, since a choice is usually a string but a
 * numeric code is common enough that forcing it through as `'1'` would bind the wrong value.
 */
export function SceneRadioButtonField({ element }: RegisteredComponentProps) {
    const buttonValue = stringProperty(element.properties, 'buttonValue') ?? numberProperty(element.properties, 'buttonValue') ?? '';

    return (
        <CommandFormField element={element}>
            {binding => (
                <RadioButtonField
                    {...binding}
                    buttonValue={buttonValue}
                    label={stringProperty(element.properties, 'label')}
                    className={stringProperty(element.properties, 'className')}
                />
            )}
        </CommandFormField>
    );
}
