// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { objectArrayProperty, stringProperty, unionProperty } from '../../properties';
import { CommandFormField } from './CommandFormField';

const RadioGroupField = lazy(async () => ({ default: (await import('@cratis/components/CommandForm')).RadioGroupField }));

/** Whether the group's buttons stack or sit in a row. */
const layouts = ['horizontal', 'vertical'] as const;

/**
 * The `Cratis.Components:radioGroupField` component - `RadioGroupField` from
 * `@cratis/components/CommandForm`.
 *
 * A whole mutually exclusive choice from one options list, which is what a screen almost always wants.
 * Use `radioButtonField` only when the individual buttons have to be placed apart from one another.
 */
export function SceneRadioGroupField({ element }: RegisteredComponentProps) {
    return (
        <CommandFormField element={element}>
            {binding => (
                <RadioGroupField
                    {...binding}
                    options={objectArrayProperty(element.properties, 'options') ?? []}
                    optionLabel={stringProperty(element.properties, 'optionLabel') ?? 'label'}
                    optionValue={stringProperty(element.properties, 'optionValue') ?? 'value'}
                    layout={unionProperty(element.properties, 'layout', layouts)}
                    className={stringProperty(element.properties, 'className')}
                />
            )}
        </CommandFormField>
    );
}
