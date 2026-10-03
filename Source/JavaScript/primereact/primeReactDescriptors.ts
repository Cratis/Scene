// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor, PropertyValueType } from '@cratis/scene.model';
import { componentRegistryKey } from '@cratis/scene.react';
import { ChartType } from './chart';
import { TreeTableSelectionMode } from './data';
import { FileUploadMode } from './file';

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
        component: key('fileUpload'),
        displayName: 'File upload',
        description: 'An accessible file picker and drop zone. A host provides its upload effect or an authored server URL.',
        properties: [
            {
                path: 'mode', label: 'Mode', group: 'Behavior', valueType: PropertyValueType.Enum, default: FileUploadMode.Advanced,
                choices: [
                    { value: FileUploadMode.Advanced, label: 'Advanced' },
                    { value: FileUploadMode.Basic, label: 'Basic' },
                    { value: FileUploadMode.Auto, label: 'Automatic' },
                ],
            },
            { path: 'url', label: 'Server URL', group: 'Upload', valueType: PropertyValueType.String },
            { path: 'name', label: 'Request field name', group: 'Upload', valueType: PropertyValueType.String, default: 'files' },
            { path: 'accept', label: 'Accepted MIME types', group: 'Upload', valueType: PropertyValueType.String },
            { path: 'multiple', label: 'Allow multiple files', group: 'Behavior', valueType: PropertyValueType.Boolean, default: false },
            { path: 'maxFileSize', label: 'Maximum file size', group: 'Upload', valueType: PropertyValueType.Number, constraints: { minimum: 0, integer: true } },
            { path: 'ariaLabel', label: 'Accessible name', group: 'Accessibility', valueType: PropertyValueType.String },
        ],
    },
    {
        component: key('dataScroller'),
        displayName: 'Data scroller',
        description: 'A progressively loaded list over the authored item collection.',
        properties: [
            { path: 'items', label: 'Items', group: 'Data', valueType: PropertyValueType.Json },
            { path: 'rows', label: 'Rows per load', group: 'Behavior', valueType: PropertyValueType.Number, default: 10, constraints: { minimum: 1, integer: true } },
            { path: 'inline', label: 'Scroll inline', group: 'Layout', valueType: PropertyValueType.Boolean, default: false },
            { path: 'scrollHeight', label: 'Inline scroll height', group: 'Layout', valueType: PropertyValueType.Number, constraints: { minimum: 0 } },
            { path: 'ariaLabel', label: 'Accessible name', group: 'Accessibility', valueType: PropertyValueType.String },
        ],
    },
    {
        component: key('treeTable'),
        displayName: 'Tree table',
        description: 'A hierarchical table with authored columns, selection, and optional pagination.',
        properties: [
            { path: 'columns', label: 'Columns', group: 'Data', valueType: PropertyValueType.Json },
            { path: 'items', label: 'Items', group: 'Data', valueType: PropertyValueType.Json },
            {
                path: 'selectionMode', label: 'Selection mode', group: 'Behavior', valueType: PropertyValueType.Enum, default: TreeTableSelectionMode.None,
                choices: [
                    { value: TreeTableSelectionMode.None, label: 'None' },
                    { value: TreeTableSelectionMode.Single, label: 'Single' },
                    { value: TreeTableSelectionMode.Multiple, label: 'Multiple' },
                    { value: TreeTableSelectionMode.Checkbox, label: 'Checkbox' },
                ],
            },
            { path: 'selection', label: 'Selection', group: 'Behavior', valueType: PropertyValueType.Json },
            { path: 'paginator', label: 'Show pagination', group: 'Behavior', valueType: PropertyValueType.Boolean, default: false },
            { path: 'rows', label: 'Rows per page', group: 'Behavior', valueType: PropertyValueType.Number, default: 10, constraints: { minimum: 1, integer: true } },
            { path: 'ariaLabel', label: 'Accessible name', group: 'Accessibility', valueType: PropertyValueType.String },
        ],
    },
    {
        component: key('editor'),
        displayName: 'Rich text editor',
        description: 'An HTML editor backed by the optional browser-only Quill peer dependency.',
        properties: [
            { path: 'value', label: 'HTML value', group: 'Content', valueType: PropertyValueType.String },
            { path: 'placeholder', label: 'Placeholder', group: 'Content', valueType: PropertyValueType.String },
            { path: 'showHeader', label: 'Show toolbar', group: 'Behavior', valueType: PropertyValueType.Boolean, default: true },
            { path: 'readOnly', label: 'Read only', group: 'Behavior', valueType: PropertyValueType.Boolean, default: false },
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
