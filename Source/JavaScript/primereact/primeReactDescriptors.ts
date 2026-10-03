// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor, PropertyValueType } from '@cratis/scene.model';
import { componentRegistryKey } from '@cratis/scene.react';
import { chartTypeChoices } from './chart/chartTypeChoices';
import { ChartType } from './chart';

const key = (name: string) => componentRegistryKey('PrimeReact', name);

/** Design-time descriptors for PrimeReact controls whose authored data has structured configuration. */
export const primeReactDescriptors: ComponentDescriptor[] = [
    {
        component: key('chart'),
        displayName: 'Chart',
        description: 'A Chart.js chart. Legacy numeric types are rendered without changing stored data; new documents use stable type names. The host application must install chart.js.',
        properties: [
            {
                path: 'type', label: 'Type', group: 'Chart', valueType: PropertyValueType.Enum, default: ChartType.Bar,
                choices: chartTypeChoices,
            },
            { path: 'data', label: 'Data', group: 'Data', valueType: PropertyValueType.Json, description: 'The Chart.js data object, including labels and datasets in their authored order.' },
            { path: 'options', label: 'Options', group: 'Chart', valueType: PropertyValueType.Json, description: 'The Chart.js options object.' },
            { path: 'emptyLabel', label: 'No data label', group: 'Accessibility', valueType: PropertyValueType.String, default: 'No chart data', description: 'Shown instead of the chart while it has no data points. Data is never invented.' },
            { path: 'responsive', label: 'Responsive', group: 'Layout', valueType: PropertyValueType.Boolean, default: true },
            { path: 'style', label: 'Style', group: 'Layout', valueType: PropertyValueType.Json, description: 'The CSS style object applied to the chart surface.' },
            { path: 'ariaLabel', label: 'Accessible name', group: 'Accessibility', valueType: PropertyValueType.String },
        ],
    },
    {
        component: key('multiStateCheckbox'),
        displayName: 'Multi-state checkbox',
        description: 'An accessible checkbox that cycles through its authored states in order.',
        properties: [
            { path: 'value', label: 'Value', group: 'State', valueType: PropertyValueType.Json, description: 'The selected value. It may be null when the empty state is enabled.' },
            { path: 'options', label: 'Options', group: 'State', valueType: PropertyValueType.Json, description: 'The ordered state options. Each may provide label, value, and icon fields.' },
            { path: 'optionLabel', label: 'Option label field', group: 'State', valueType: PropertyValueType.String, default: 'label' },
            { path: 'optionValue', label: 'Option value field', group: 'State', valueType: PropertyValueType.String, default: 'value' },
            { path: 'empty', label: 'Allow empty state', group: 'State', valueType: PropertyValueType.Boolean, default: true },
            { path: 'emptyLabel', label: 'Empty state label', group: 'Accessibility', valueType: PropertyValueType.String, default: 'No selection' },
            { path: 'icons', label: 'Icons', group: 'Appearance', valueType: PropertyValueType.Json, description: 'Icons aligned with the options, or keyed by their values. Each is a PrimeIcons class name or a qualified icon reference. Icons inside this value are not tracked by the icon library diagnostics; use the empty state icon where a tracked icon is needed.' },
            { path: 'emptyIcon', label: 'Empty state icon', group: 'Appearance', valueType: PropertyValueType.Icon },
            { path: 'readOnly', label: 'Read only', group: 'Behavior', valueType: PropertyValueType.Boolean, default: false },
            { path: 'disabled', label: 'Disabled', group: 'Behavior', valueType: PropertyValueType.Boolean, default: false },
            { path: 'ariaLabel', label: 'Accessible name', group: 'Accessibility', valueType: PropertyValueType.String },
        ],
    },
];
