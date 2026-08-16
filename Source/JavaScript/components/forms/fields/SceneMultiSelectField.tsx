// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, objectArrayProperty, stringProperty } from '../../properties';
import { CommandFormField } from './CommandFormField';

const MultiSelectField = lazy(async () => ({ default: (await import('@cratis/components/CommandForm')).MultiSelectField }));

/**
 * The `Cratis.Components:multiSelectField` component - `MultiSelectField` from
 * `@cratis/components/CommandForm`.
 *
 * The many-valued counterpart to `dropdownField`, binding to a collection property on the command rather
 * than a scalar one.
 *
 * The `display` and `maxSelectedLabels` properties this adapter used to expose are gone. In
 * `@cratis/components` 3.0.0 the field is re-expressed over the library's own `Dropdown` in multiple
 * mode, because PrimeReact 11's `Select` has no `multiple` prop of the version 10 shape and renders the
 * selection through its own value slot - so there is no comma mode, no chip mode, and no label-collapse
 * threshold left to choose between. Both props are still declared upstream so call sites compile, and
 * neither is read. Passing them on would have let a screen state a preference the control cannot honor.
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
                    filter={booleanProperty(element.properties, 'filter')}
                    showClear={booleanProperty(element.properties, 'showClear')}
                    className={stringProperty(element.properties, 'className')}
                />
            )}
        </CommandFormField>
    );
}
