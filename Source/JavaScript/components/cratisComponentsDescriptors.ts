// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingMode, BindingSourceKind, ComponentDescriptor, DesignTimeActionPlacement, PropertyDescriptor, PropertyValueType, QueryResultShape } from '@cratis/scene.model';
import { componentRegistryKey } from '@cratis/scene.react';

// The package name, spelled out so describing components does not pull every adapter (and its UI dependencies) in
// with it; the bundle's validation checks each key against the manifest.
const key = (name: string) => componentRegistryKey('Cratis.Components', name);

/**
 * The properties every query-bound data table shares: which query feeds it, and the few settings that shape how
 * it shows the result.
 *
 * `query` is a `QueryReference`, so an editor binds it to a host-supplied query candidate and validates the
 * arguments against it. What is stored is a `QueryBinding`; a plain query name - what screens carried before
 * bindings existed - is still read, as a binding with no explicit connections. The columns are not properties:
 * they are the `content` slot's children, edited as nodes.
 */
const dataTableProperties: PropertyDescriptor[] = [
    {
        path: 'query', label: 'Query', group: 'Data', valueType: PropertyValueType.QueryReference, editorKind: 'queryBinding',
        description: 'The collection query that feeds the table.',
        constraints: { required: true, resultShapes: [QueryResultShape.Collection] },
    },
    { path: 'emptyMessage', label: 'Empty message', group: 'Content', valueType: PropertyValueType.String, default: '' },
    {
        path: 'dataKey', label: 'Row identity', group: 'Data', valueType: PropertyValueType.String, editorKind: 'resultField',
        description: 'The result field that identifies a row.',
    },
    {
        path: 'globalFilterFields', label: 'Searchable fields', group: 'Data', valueType: PropertyValueType.Object, editorKind: 'resultFieldList',
        description: 'The result fields the table\'s search box looks in.',
    },
    {
        path: 'selectedItem', label: 'Selected item', group: 'Outputs', valueType: PropertyValueType.Object, readOnly: true,
        output: true, bindingMode: BindingMode.OneWay,
        description: 'The currently selected row, or null after selection is cleared.',
    },
];

const commandFormProperties: PropertyDescriptor[] = [
    {
        path: 'command', label: 'Command', group: 'Command', valueType: PropertyValueType.String, editorKind: 'commandBinding',
        constraints: { required: true },
        description: 'The Arc command proxy rendered through the native command form runtime.',
    },
    {
        path: 'mode', label: 'Mode', group: 'Layout', valueType: PropertyValueType.Enum,
        choices: [{ value: 'auto', label: 'Auto' }, { value: 'manual', label: 'Manual' }], default: 'auto',
        description: 'Auto follows command metadata; manual renders explicit inputs inside the same native form boundary.',
    },
    { path: 'columns', label: 'Legacy columns', group: 'Layout', valueType: PropertyValueType.Number, default: 1, description: 'Backward-compatible column count used when no typed layout metadata is authored.' },
    { path: 'layout', label: 'Layout', group: 'Layout', valueType: PropertyValueType.Object, editorKind: 'commandFormLayout', description: 'Typed command-form geometry: columns, gaps and field placements. Independent of auto/manual field generation.' },
    { path: 'fieldWidths', label: 'Legacy field widths', group: 'Layout', valueType: PropertyValueType.Object, editorKind: 'fieldWidths' },
    {
        path: 'inputs', label: 'Fields', group: 'Layout', valueType: PropertyValueType.Collection, editorKind: 'commandFields',
        acceptedBindingKinds: [BindingSourceKind.DataContext, BindingSourceKind.ComponentProperty],
        item: {
            label: 'Field',
            properties: [
                { path: 'property', label: 'Property', group: 'Field', valueType: PropertyValueType.String },
                { path: 'type', label: 'Type', group: 'Field', valueType: PropertyValueType.Enum, choices: [{ value: 'string', label: 'String' }, { value: 'guid', label: 'Guid' }] },
                { path: 'label', label: 'Label', group: 'Field', valueType: PropertyValueType.String },
                { path: 'column', label: 'Legacy column', group: 'Layout', valueType: PropertyValueType.Number },
                { path: 'width', label: 'Legacy width token', group: 'Layout', valueType: PropertyValueType.String },
                { path: 'placement', label: 'Placement', group: 'Layout', valueType: PropertyValueType.Object, editorKind: 'commandFormFieldPlacement' },
            ],
        },
    },
    {
        path: 'exclude', label: 'Excluded fields', group: 'Command', valueType: PropertyValueType.Collection,
        item: { label: 'Excluded field', properties: [{ path: 'property', label: 'Property', group: 'Field', valueType: PropertyValueType.String }] },
    },
    { path: 'submitLabel', label: 'Submit label', group: 'Content', valueType: PropertyValueType.String, default: 'Submit' },
];

/**
 * What can be edited on the `Cratis.Components` package's components.
 *
 * Only the query-bound tables are described so far; the form, dialog and editor composites carry
 * Arc proxy classes by name and are configured through their own tooling. A package adds a descriptor here the
 * same way it adds a component to the manifest.
 */
export const cratisComponentsDescriptors: ComponentDescriptor[] = [
    { component: key('dataTable'), displayName: 'Data table', properties: dataTableProperties },
    { component: key('table'), displayName: 'Table', properties: dataTableProperties },
    { component: key('observableDataTable'), displayName: 'Live data table', properties: dataTableProperties },
    {
        component: key('commandForm'),
        displayName: 'Command form',
        editorKind: 'commandFormDesigner',
        properties: commandFormProperties,
        actions: [{
            id: 'Cratis.Components.commandForm.generateFields',
            label: 'Generate fields',
            placement: DesignTimeActionPlacement.Toolbar,
            availability: 'commandForm.canGenerateFields',
            description: 'Creates a deterministic editable field layout from the selected command metadata.',
        }],
    },
];
