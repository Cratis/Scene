// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Dropdown } from '@cratis/components/Dropdown';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, objectArrayProperty, stringProperty } from '../properties';

/**
 * The `Cratis.Components:dropdown` component - `Dropdown` from `@cratis/components/Dropdown`.
 *
 * The library's own `Dropdown` rather than PrimeReact's `Select`, and the reason changed with PrimeReact
 * 11. It used to be the overlay z-index fix: a version 10 dropdown panel opened inside a dialog rendered
 * within the dialog's own subtree and could land under its mask, so the library appended every overlay to
 * the document body and handed out z-indexes itself. Version 11 does both natively - the select panel
 * portals to the body and the shared z-index registry puts a later overlay above whatever is already
 * open - and `@cratis/components` 3.0.0 accordingly deleted that workaround. What the wrapper is worth
 * now is its curated surface: a single/multi select expressed in `options` / `optionLabel` /
 * `optionValue` terms, where version 11's `Select` is compositional (`Select.Root`, `.Trigger`,
 * `.Portal`, `.Popup`, `.List`, `.Option`) and would have to be assembled here, in an adapter whose whole
 * input is a property bag.
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
