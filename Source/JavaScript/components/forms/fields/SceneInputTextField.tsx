// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty, unionProperty } from '../../properties';
import { CommandFormField } from './CommandFormField';

const InputTextField = lazy(async () => ({ default: (await import('@cratis/components/CommandForm')).InputTextField }));

/**
 * The HTML input types `InputTextField` supports, as a tuple so `unionProperty` narrows an authored
 * string to exactly one of them and falls back to the component's own default for anything else.
 */
const inputTypes = ['text', 'email', 'password', 'color', 'date', 'datetime-local', 'time', 'url', 'tel', 'search'] as const;

/**
 * The `Cratis.Components:inputTextField` component - `InputTextField` from `@cratis/components/CommandForm`.
 *
 * The single-line text field, and the one a screen reaches for most. `type` carries all the way through
 * to the HTML input, so `email`, `password` and `url` fields are this component too rather than separate
 * names - the browser's own keyboard and validation behavior is what differs, not the binding.
 */
export function SceneInputTextField({ element }: RegisteredComponentProps) {
    return (
        <CommandFormField element={element}>
            {binding => (
                <InputTextField
                    {...binding}
                    type={unionProperty(element.properties, 'type', inputTypes)}
                    placeholder={stringProperty(element.properties, 'placeholder')}
                    className={stringProperty(element.properties, 'className')}
                />
            )}
        </CommandFormField>
    );
}
