// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { RadioButton } from 'primereact/radiobutton';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, optionsProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:radioButton` component - one exclusive choice out of several.
 *
 * PrimeReact's RadioButton is a single button, but a lone radio button is never what a screen means: the
 * choice is the group. The adapter therefore renders the whole group from `options`, sharing one
 * `name` so the browser enforces exclusivity, and falls back to a single button when only a `label` was
 * given.
 */
export function PrimeRadioButton({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState<string | undefined>(stringProperty(element, 'value'));
    const options = optionsProperty(element, 'options');
    const choices = options.length > 0 ? options : [{ label: stringProperty(element, 'label', 'Option'), value: element.id }];
    const disabled = booleanProperty(element, 'disabled', false);
    return (
        <div data-scene-id={element.id} className='flex flex-col gap-2'>
            {choices.map((choice) => (
                <div key={choice.value} className='flex items-center gap-2'>
                    <RadioButton
                        inputId={`${element.id}-${choice.value}`}
                        name={element.id}
                        value={choice.value}
                        checked={value === choice.value}
                        onChange={(event) => setValue(event.value)}
                        disabled={disabled}
                    />
                    <label htmlFor={`${element.id}-${choice.value}`}>{choice.label}</label>
                </div>
            ))}
        </div>
    );
}
