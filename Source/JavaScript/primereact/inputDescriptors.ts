// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor, PropertyDescriptor, PropertyValueType } from '@cratis/scene.model';
import { componentRegistryKey, valueOutputProperty } from '@cratis/scene.react';

const key = (name: string) => componentRegistryKey('PrimeReact', name);

const common: PropertyDescriptor[] = [
    { path: 'ariaLabel', label: 'Accessible name', group: 'Accessibility', valueType: PropertyValueType.String },
    { path: 'disabled', label: 'Disabled', group: 'Behavior', valueType: PropertyValueType.Boolean, default: false },
];
const placeholder: PropertyDescriptor = { path: 'placeholder', label: 'Placeholder', group: 'Content', valueType: PropertyValueType.String };
const checked: PropertyDescriptor = { path: 'checked', label: 'Initially checked', group: 'Content', valueType: PropertyValueType.Boolean, default: false };

function input(name: string, displayName: string, valueType: PropertyValueType, properties: PropertyDescriptor[] = [placeholder]): ComponentDescriptor {
    const output = valueOutputProperty(valueType);
    // A selection publishes the chosen option values; the item descriptor names them for a binding picker.
    const value = valueType === PropertyValueType.Collection ? { ...output, item: { label: 'option value', properties: [] } } : output;
    return { component: key(name), displayName, properties: [...properties, ...common, value] };
}

/**
 * The input widgets that publish what the user entered as their `value` output (Cratis/StudioIssues#156).
 * A designer offers the output as a binding source; a command action maps it as `component.<id>.value`.
 */
export const primeReactInputDescriptors: ComponentDescriptor[] = [
    input('inputText', 'Text input', PropertyValueType.String),
    input('inputTextarea', 'Text area', PropertyValueType.String),
    input('password', 'Password', PropertyValueType.String),
    input('inputNumber', 'Number input', PropertyValueType.Number),
    input('calendar', 'Date picker', PropertyValueType.String),
    input('dropdown', 'Dropdown', PropertyValueType.String),
    input('multiSelect', 'Multi-select', PropertyValueType.Collection),
    input('radioButton', 'Radio group', PropertyValueType.String, []),
    input('checkbox', 'Checkbox', PropertyValueType.Boolean, [checked, { path: 'label', label: 'Label', group: 'Content', valueType: PropertyValueType.String }]),
    input('toggleSwitch', 'Toggle switch', PropertyValueType.Boolean, [checked]),
];
