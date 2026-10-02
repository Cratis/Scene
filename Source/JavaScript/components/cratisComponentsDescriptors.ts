// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor, PropertyDescriptor, PropertyValueType, QueryResultShape } from '@cratis/scene.model';
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
];
