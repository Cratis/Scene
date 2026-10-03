// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor, PropertyValueType } from '@cratis/scene.model';
import { componentRegistryKey } from '@cratis/scene.react';
import { ChartType } from './chart';

const key = (name: string) => componentRegistryKey('PrimeReact', name);

/** Design-time descriptors for PrimeReact controls whose authored data has structured configuration. */
export const primeReactDescriptors: ComponentDescriptor[] = [
    {
        component: key('chart'),
        displayName: 'Chart',
        description: 'A Chart.js chart. Legacy numeric types are rendered without changing stored data; new documents use stable type names.',
        properties: [
            {
                path: 'type', label: 'Type', group: 'Chart', valueType: PropertyValueType.Enum, default: ChartType.Bar,
                choices: [
                    { value: ChartType.Bar, label: 'Bar' },
                    { value: ChartType.Line, label: 'Line' },
                    { value: ChartType.Pie, label: 'Pie' },
                    { value: ChartType.Doughnut, label: 'Doughnut' },
                    { value: ChartType.PolarArea, label: 'Polar area' },
                    { value: ChartType.Radar, label: 'Radar' },
                    { value: ChartType.Bubble, label: 'Bubble' },
                    { value: ChartType.Scatter, label: 'Scatter' },
                ],
            },
            { path: 'data', label: 'Data', group: 'Data', valueType: PropertyValueType.Json, description: 'The Chart.js data object, including labels and datasets in their authored order.' },
            { path: 'options', label: 'Options', group: 'Chart', valueType: PropertyValueType.Json, description: 'The Chart.js options object.' },
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
            { path: 'icons', label: 'Icons', group: 'Appearance', valueType: PropertyValueType.Json, description: 'Icons aligned with the options, or keyed by their values.' },
            { path: 'disabled', label: 'Disabled', group: 'Behavior', valueType: PropertyValueType.Boolean, default: false },
            { path: 'ariaLabel', label: 'Accessible name', group: 'Accessibility', valueType: PropertyValueType.String },
        ],
    },
];
