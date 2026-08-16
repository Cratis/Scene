// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Dropdown } from '@cratis/components/Dropdown';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, objectArrayProperty, stringProperty } from '../properties';

/**
 * The `Cratis.Components:dropdown` component - `Dropdown` from `@cratis/components/Dropdown`.
 *
 * The library's own `Dropdown` rather than PrimeReact's, because it carries the overlay z-index fix the
 * library applies across every overlay it owns - a dropdown inside a dialog renders above the dialog
 * instead of behind it, which is the single most common overlay bug in a PrimeReact application.
 *
 * This is the standalone dropdown, not the command-form one: it takes its options from the screen and is
 * not bound to a command property. Use `dropdownField` inside a `commandForm`.
 */
export function SceneDropdown({ element }: RegisteredComponentProps) {
    return (
        <Dropdown
            options={objectArrayProperty(element.properties, 'options') ?? []}
            optionLabel={stringProperty(element.properties, 'optionLabel') ?? 'label'}
            optionValue={stringProperty(element.properties, 'optionValue') ?? 'value'}
            placeholder={stringProperty(element.properties, 'placeholder')}
            disabled={booleanProperty(element.properties, 'disabled')}
            showClear={booleanProperty(element.properties, 'showClear')}
            filter={booleanProperty(element.properties, 'filter')}
            className={stringProperty(element.properties, 'className')}
        />
    );
}
