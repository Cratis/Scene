// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingSourceKind, ComponentDescriptor, PropertyDescriptor, PropertyEditorKind, PropertyValueType } from '@cratis/scene.model';
import { componentRegistryKey, describeComponents } from '@cratis/scene.react';
import { chartTypeChoices } from './chart/chartTypeChoices';
import { legacyEnumerationChoices } from './legacyEnumerationChoices';
import { ChartType } from './chart';
import { TreeTableSelectionMode } from './data';
import { FileUploadMode } from './file';
import { primeReactInputDescriptors } from './inputDescriptors';
import { primeReactComponentMetadata } from './primeReactComponentMetadata';

const key = (name: string) => componentRegistryKey('PrimeReact', name);

/** Structured values keep accepting what a screen binds them to - a query's rows, a data context - as they did when they were any JSON. */
const bindable = [BindingSourceKind.DataContext, BindingSourceKind.QueryResult, BindingSourceKind.ComponentProperty];
const choice = (...values: string[]) => values.map(value => ({ value, label: value }));
const text = (path: string, label: string, description?: string): PropertyDescriptor => ({ path, label, group: 'Content', valueType: PropertyValueType.String, ...(description ? { description } : {}) });
const flag = (path: string, label: string, description?: string): PropertyDescriptor => ({ path, label, group: 'Content', valueType: PropertyValueType.Boolean, ...(description ? { description } : {}) });
const numeric = (path: string, label: string, description?: string): PropertyDescriptor => ({ path, label, group: 'Content', valueType: PropertyValueType.Number, ...(description ? { description } : {}) });
const list = (path: string, label: string, editorKind: PropertyEditorKind, description?: string): PropertyDescriptor => ({ path, label, group: 'Content', valueType: PropertyValueType.Json, editorKind, ...(description ? { description } : {}) });

/** The Chart.js data object: its labels and its datasets, with the fields of a dataset that authors set most. Anything else a dataset carries is kept. */
const chartData: PropertyDescriptor['properties'] = [
    list('labels', 'Labels', PropertyEditorKind.StringList, 'One label for each point of every dataset, in order.'),
    {
        path: 'datasets', label: 'Datasets', group: 'Content', valueType: PropertyValueType.Collection,
        item: {
            label: 'Dataset',
            open: true,
            positional: true,
            properties: [
                text('label', 'Label'),
                list('data', 'Values', PropertyEditorKind.NumberList, 'One value for each label, in order.'),
                list('backgroundColor', 'Fill colour', PropertyEditorKind.StringOrList, 'One CSS colour for the whole dataset, or one for each point.'),
                list('borderColor', 'Border colour', PropertyEditorKind.StringOrList, 'One CSS colour for the whole dataset, or one for each point.'),
                numeric('borderWidth', 'Border width'),
                flag('fill', 'Fill under the line'),
                numeric('tension', 'Line tension', 'How much a line curves between points: 0 is straight.'),
            ],
        },
    },
];

/** The Chart.js options authors set most; any other option the stored value carries is kept. */
const chartOptions: PropertyDescriptor['properties'] = [
    flag('responsive', 'Responsive'),
    flag('maintainAspectRatio', 'Keep the aspect ratio'),
    numeric('aspectRatio', 'Aspect ratio', 'Width divided by height.'),
    { path: 'indexAxis', label: 'Index axis', group: 'Content', valueType: PropertyValueType.Enum, choices: choice('x', 'y'), description: 'The axis the labels run along; y draws horizontal bars.' },
    {
        path: 'plugins', label: 'Plugins', group: 'Content', valueType: PropertyValueType.Object, open: true,
        properties: [
            {
                path: 'legend', label: 'Legend', group: 'Content', valueType: PropertyValueType.Object, open: true,
                properties: [flag('display', 'Show the legend'), { path: 'position', label: 'Position', group: 'Content', valueType: PropertyValueType.Enum, choices: choice('top', 'left', 'bottom', 'right') }],
            },
            {
                path: 'title', label: 'Title', group: 'Content', valueType: PropertyValueType.Object, open: true,
                properties: [flag('display', 'Show the title'), text('text', 'Text')],
            },
        ],
    },
];

/** The CSS sizes that shape the surface a chart is drawn on. */
const chartStyle: PropertyDescriptor['properties'] = ['width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight'].map(name => text(name, name.replace(/([A-Z])/g, ' $1').replace(/^./, first => first.toUpperCase()), 'A CSS length such as 320px or 100%.'));

/**
 * A tree node: the fields of Scene's tree model. Children are the same shape; the description goes as deep as a tree is authored by hand,
 * and a node below that keeps its own children without editing them.
 */
function treeNode(depth: number): PropertyDescriptor[] {
    const fields: PropertyDescriptor[] = [
        text('key', 'Key', 'Identity across the whole tree. Derived from the node\'s position when it is not set.'),
        text('label', 'Label'),
        text('icon', 'Icon', 'A PrimeIcons class name such as pi pi-folder.'),
        flag('leaf', 'Leaf'),
        flag('expanded', 'Expanded'),
        flag('selectable', 'Selectable'),
        { path: 'data', label: 'Data', group: 'Content', valueType: PropertyValueType.Object, editorKind: PropertyEditorKind.StringMap, description: 'The values the node shows, under the field names the columns use.' },
    ];

    if (depth > 0) {
        fields.push({ path: 'children', label: 'Children', group: 'Content', valueType: PropertyValueType.Collection, item: { label: 'Node', open: true, positional: true, properties: treeNode(depth - 1) } });
    }

    return fields;
}

/** Design-time descriptors for PrimeReact controls whose authored data has structured configuration. */
const describedPrimeReact: ComponentDescriptor[] = [
    ...primeReactInputDescriptors,
    {
        component: key('chart'),
        displayName: 'Chart',
        description: 'A Chart.js chart. Legacy numeric types are rendered without changing stored data; new documents use stable type names. The host application must install chart.js.',
        properties: [
            {
                path: 'type', label: 'Type', group: 'Chart', valueType: PropertyValueType.Enum, default: ChartType.Bar,
                choices: chartTypeChoices,
            },
            { path: 'data', label: 'Data', group: 'Data', valueType: PropertyValueType.Object, open: true, properties: chartData, acceptedBindingKinds: bindable, description: 'The Chart.js data object, including labels and datasets in their authored order.' },
            { path: 'options', label: 'Options', group: 'Chart', valueType: PropertyValueType.Object, open: true, properties: chartOptions, acceptedBindingKinds: bindable, description: 'The Chart.js options object. The options listed here are the ones authors set most; any other option it holds is kept.' },
            { path: 'emptyLabel', label: 'No data label', group: 'Accessibility', valueType: PropertyValueType.String, default: 'No chart data', description: 'Shown instead of the chart while it has no data points. Data is never invented.' },
            { path: 'responsive', label: 'Responsive', group: 'Layout', valueType: PropertyValueType.Boolean, default: true },
            { path: 'style', label: 'Style', group: 'Layout', valueType: PropertyValueType.Object, open: true, properties: chartStyle, acceptedBindingKinds: bindable, description: 'The CSS style object applied to the chart surface.' },
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
            { path: 'items', label: 'Items', group: 'Data', valueType: PropertyValueType.Json, editorKind: PropertyEditorKind.StringList, description: 'The text of each item, in order. A record is titled by its label, title, name, text or header field; records authored in a file are kept but not edited here.' },
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
            {
                path: 'columns', label: 'Columns', group: 'Data', valueType: PropertyValueType.Collection, acceptedBindingKinds: bindable, description: 'Column definitions with field and header, or nested column elements. Inferred from the first row when absent.',
                item: { label: 'Column', open: true, positional: true, properties: [text('field', 'Field', 'The name in a node\'s data that the column shows.'), text('header', 'Header', 'The column heading. The field name when it is not set.'), flag('sortable', 'Sortable')] },
            },
            { path: 'items', label: 'Items', group: 'Data', valueType: PropertyValueType.Collection, item: { label: 'Node', open: true, positional: true, properties: treeNode(3) }, acceptedBindingKinds: bindable, description: 'The nodes: records with key, label, data, children, expanded and selectable.' },
            {
                path: 'selectionMode', label: 'Selection mode', group: 'Behavior', valueType: PropertyValueType.Enum, default: TreeTableSelectionMode.None,
                choices: legacyEnumerationChoices(TreeTableSelectionMode, { [TreeTableSelectionMode.None]: 'None', [TreeTableSelectionMode.Single]: 'Single', [TreeTableSelectionMode.Multiple]: 'Multiple', [TreeTableSelectionMode.Checkbox]: 'Checkbox' }),
            },
            { path: 'selection', label: 'Selection', group: 'Behavior', valueType: PropertyValueType.Json, editorKind: PropertyEditorKind.StringOrList, description: 'The key of the selected node, or the keys of the selected nodes.' },
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
        description: 'An accessible button that cycles through its authored states in order, showing the current state as a checkbox-style glyph.',
        properties: [
            { path: 'value', label: 'Value', group: 'State', valueType: PropertyValueType.Json, editorKind: PropertyEditorKind.Scalar, description: 'The selected value: a word, a number or a flag. Not set when the empty state is selected.' },
            {
                path: 'options', label: 'Options', group: 'State', valueType: PropertyValueType.Collection, acceptedBindingKinds: bindable, description: 'The ordered state options. Each may provide label, value, and icon fields.',
                item: { label: 'State', open: true, positional: true, properties: [text('label', 'Label'), text('value', 'Value'), text('icon', 'Icon', 'A PrimeIcons class name such as pi pi-check.')] },
            },
            { path: 'optionLabel', label: 'Option label field', group: 'State', valueType: PropertyValueType.String, default: 'label' },
            { path: 'optionValue', label: 'Option value field', group: 'State', valueType: PropertyValueType.String, default: 'value' },
            { path: 'empty', label: 'Allow empty state', group: 'State', valueType: PropertyValueType.Boolean, default: true },
            { path: 'emptyLabel', label: 'Empty state label', group: 'Accessibility', valueType: PropertyValueType.String, default: 'No selection' },
            { path: 'icons', label: 'Icons', group: 'Appearance', valueType: PropertyValueType.Json, editorKind: PropertyEditorKind.StringList, description: 'One icon for each option, in the order of the options. Each is a PrimeIcons class name or a qualified icon reference. Icons inside this value are not tracked by the icon library diagnostics; use the empty state icon where a tracked icon is needed.' },
            { path: 'emptyIcon', label: 'Empty state icon', group: 'Appearance', valueType: PropertyValueType.Icon },
            { path: 'readOnly', label: 'Read only', group: 'Behavior', valueType: PropertyValueType.Boolean, default: false },
            { path: 'disabled', label: 'Disabled', group: 'Behavior', valueType: PropertyValueType.Boolean, default: false },
            { path: 'ariaLabel', label: 'Accessible name', group: 'Accessibility', valueType: PropertyValueType.String },
        ],
    },
];

/** The `PrimeReact` descriptors: the hand-written ones above with every component's category, icon, keywords and design mode (CMP1). */
export const primeReactDescriptors: ComponentDescriptor[] = describeComponents('PrimeReact', describedPrimeReact, primeReactComponentMetadata);