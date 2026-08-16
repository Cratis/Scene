// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, numberProperty, objectArrayProperty, stringProperty, unionProperty } from '../../properties';
import { CommandFormField } from './CommandFormField';

const MultiSelectField = lazy(async () => ({ default: (await import('@cratis/components/CommandForm')).MultiSelectField }));

/** How the current selection is summarized in the closed control. */
const displayModes = ['comma', 'chip'] as const;

/**
 * The `Cratis.Components:multiSelectField` component - `MultiSelectField` from
 * `@cratis/components/CommandForm`.
 *
 * The many-valued counterpart to `dropdownField`, binding to a collection property on the command rather
 * than a scalar one.
 */
export function SceneMultiSelectField({ element }: RegisteredComponentProps) {
    return (
        <CommandFormField element={element}>
            {binding => (
                <MultiSelectField
                    {...binding}
                    options={objectArrayProperty(element.properties, 'options') ?? []}
                    optionLabel={stringProperty(element.properties, 'optionLabel') ?? 'label'}
                    optionValue={stringProperty(element.properties, 'optionValue') ?? 'value'}
                    placeholder={stringProperty(element.properties, 'placeholder')}
                    display={unionProperty(element.properties, 'display', displayModes)}
                    maxSelectedLabels={numberProperty(element.properties, 'maxSelectedLabels')}
                    filter={booleanProperty(element.properties, 'filter')}
                    showClear={booleanProperty(element.properties, 'showClear')}
                    className={stringProperty(element.properties, 'className')}
                />
            )}
        </CommandFormField>
    );
}
