// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor, PropertyValueType } from '@cratis/scene.model';
import { componentRegistryKey } from '@cratis/scene.react';
import { chartTypeChoices } from './chart/chartTypeChoices';
import { legacyEnumerationChoices } from './legacyEnumerationChoices';
import { ChartType } from './chart';
import { TreeTableSelectionMode } from './data';
import { FileUploadMode } from './file';

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
        component: key('fileUpload'),
        displayName: 'File upload',
        description: 'An accessible file picker and drop zone. A host provides its upload effect, or the files are posted to the authored server URL. The URL must be on the page\'s own origin unless the host allows another one.',
        properties: [
            {
                path: 'mode', label: 'Mode', group: 'Behavior', valueType: PropertyValueType.Enum, default: FileUploadMode.Advanced,
                choices: legacyEnumerationChoices(FileUploadMode, { [FileUploadMode.Advanced]: 'Advanced', [FileUploadMode.Basic]: 'Basic', [FileUploadMode.Auto]: 'Automatic' }),
            },
            { path: 'url', label: 'Server URL', group: 'Upload', valueType: PropertyValueType.String, description: 'Where the files are posted. Only the origin of the page, or an origin the host allows, is accepted; anything else is refused and nothing is sent.' },
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
        description: 'A list that loads a chunk at a time as its end is reached. Items are strings, numbers or records, plus any child elements in the items slot; serialized legacy UI elements are refused.',
        properties: [
            { path: 'items', label: 'Items', group: 'Data', valueType: PropertyValueType.Json, description: 'Strings, numbers or records. A record is titled by its label, title, name, text or header field.' },
            { path: 'rows', label: 'Rows per load', group: 'Behavior', valueType: PropertyValueType.Number, default: 10, constraints: { minimum: 1, integer: true } },
            { path: 'inline', label: 'Scroll inline', group: 'Layout', valueType: PropertyValueType.Boolean, default: false, description: 'Scroll inside the control (true) or load as the page scrolls the end of the list into view (false).' },
            { path: 'scrollHeight', label: 'Inline scroll height', group: 'Layout', valueType: PropertyValueType.Number, constraints: { minimum: 1 }, description: 'The height in pixels of an inline scroller. 320 when omitted.' },
            { path: 'emptyLabel', label: 'No items label', group: 'Accessibility', valueType: PropertyValueType.String, default: 'No items to show' },
            { path: 'ariaLabel', label: 'Accessible name', group: 'Accessibility', valueType: PropertyValueType.String },
        ],
    },
    {
        component: key('treeTable'),
        displayName: 'Tree table',
        description: 'A hierarchical table with authored columns, selection, and optional pagination. Items are nodes (strings, numbers or records with key, label, data, children); serialized legacy UI elements are refused.',
        properties: [
            { path: 'columns', label: 'Columns', group: 'Data', valueType: PropertyValueType.Json, description: 'Column definitions with field and header, or nested column elements. Inferred from the first row when absent.' },
            { path: 'items', label: 'Items', group: 'Data', valueType: PropertyValueType.Json, description: 'The nodes: strings, numbers, or records with key, label, data, children, expanded and selectable.' },
            {
                path: 'selectionMode', label: 'Selection mode', group: 'Behavior', valueType: PropertyValueType.Enum, default: TreeTableSelectionMode.None,
                choices: legacyEnumerationChoices(TreeTableSelectionMode, { [TreeTableSelectionMode.None]: 'None', [TreeTableSelectionMode.Single]: 'Single', [TreeTableSelectionMode.Multiple]: 'Multiple', [TreeTableSelectionMode.Checkbox]: 'Checkbox' }),
            },
            { path: 'selection', label: 'Selection', group: 'Behavior', valueType: PropertyValueType.Json, description: 'The selected node keys: a key, an array of keys or { key } objects, or PrimeReact\'s key map.' },
            { path: 'paginator', label: 'Show pagination', group: 'Behavior', valueType: PropertyValueType.Boolean, default: false },
            { path: 'rows', label: 'Rows per page', group: 'Behavior', valueType: PropertyValueType.Number, default: 10, constraints: { minimum: 1, integer: true } },
            { path: 'emptyLabel', label: 'No records label', group: 'Accessibility', valueType: PropertyValueType.String, default: 'No records found' },
            { path: 'ariaLabel', label: 'Accessible name', group: 'Accessibility', valueType: PropertyValueType.String },
        ],
    },
    {
        component: key('editor'),
        displayName: 'Rich text editor',
        description: 'A rich-text HTML editor. Editing needs the host to provide Quill (QuillLoaderProvider); without it the content is shown read-only. The HTML is sanitized before it is shown.',
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
            { path: 'icons', label: 'Icons', group: 'Appearance', valueType: PropertyValueType.Json, description: 'Icons aligned with the options, or keyed by their values. Each is a PrimeIcons class name or a qualified icon reference. Icons inside this value are not tracked by the icon library diagnostics; use the empty state icon where a tracked icon is needed.' },
            { path: 'emptyIcon', label: 'Empty state icon', group: 'Appearance', valueType: PropertyValueType.Icon },
            { path: 'readOnly', label: 'Read only', group: 'Behavior', valueType: PropertyValueType.Boolean, default: false },
            { path: 'disabled', label: 'Disabled', group: 'Behavior', valueType: PropertyValueType.Boolean, default: false },
            { path: 'ariaLabel', label: 'Accessible name', group: 'Accessibility', valueType: PropertyValueType.String },
        ],
    },
];
