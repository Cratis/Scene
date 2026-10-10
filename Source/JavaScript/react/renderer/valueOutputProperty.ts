// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingMode, PropertyDescriptor, PropertyValueType } from '@cratis/scene.model';
import { valueOutputName } from './useValueOutput';

/**
 * The descriptor entry an input widget declares for the value it publishes with `useValueOutput`, so a
 * designer can offer it as a binding source - for a detail component, a query argument or a command input.
 *
 * @param valueType The type of value the widget publishes.
 * @param description What the value is, when the default sentence does not say enough.
 */
export function valueOutputProperty(valueType: PropertyValueType, description = 'What the user has entered, published as the input changes.'): PropertyDescriptor {
    return {
        path: valueOutputName,
        label: 'Value',
        group: 'Outputs',
        valueType,
        readOnly: true,
        output: true,
        bindingMode: BindingMode.OneWay,
        description,
    };
}
