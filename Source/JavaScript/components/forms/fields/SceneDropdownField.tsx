// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { objectArrayProperty, stringProperty } from '../../properties';
import { CommandFormField } from './CommandFormField';

const DropdownField = lazy(async () => ({ default: (await import('@cratis/components/CommandForm')).DropdownField }));

/**
 * The `Cratis.Components:dropdownField` component - `DropdownField` from `@cratis/components/CommandForm`.
 *
 * Single selection from a fixed list the screen carries inline. `optionLabel` and `optionValue` default
 * to `label` and `value`, the shape an authored list takes when nobody says otherwise, so the common
 * case needs only `options`.
 *
 * Options that have to come from the backend are a different component: bind the list to a query with
 * `dataTable`, or register the lookup as its own query. A property bag is the wrong place for data.
 */
export function SceneDropdownField({ element }: RegisteredComponentProps) {
    return (
        <CommandFormField element={element}>
            {binding => (
                <DropdownField
                    {...binding}
                    options={objectArrayProperty(element.properties, 'options') ?? []}
                    optionLabel={stringProperty(element.properties, 'optionLabel') ?? 'label'}
                    optionValue={stringProperty(element.properties, 'optionValue') ?? 'value'}
                    placeholder={stringProperty(element.properties, 'placeholder')}
                    className={stringProperty(element.properties, 'className')}
                />
            )}
        </CommandFormField>
    );
}
