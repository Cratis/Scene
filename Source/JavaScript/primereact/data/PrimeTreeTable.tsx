// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Column } from 'primereact/column';
import { TreeTable } from 'primereact/treetable';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { recordArrayProperty, stringArrayProperty } from '../properties';
import { treeNodesProperty } from '../treeNodes';

/**
 * The `PrimeReact:treeTable` component - a table whose rows nest.
 *
 * Columns address the node's `data` object, so they are read from a `columns` property here rather than
 * inferred: a tree node's own shape (key, label, children) is structure, not data, and inferring columns
 * from it would produce a table of the tree's plumbing.
 */
export function PrimeTreeTable({ element }: RegisteredComponentProps) {
    const nodes = treeNodesProperty(element, 'nodes');
    const named = recordArrayProperty(element, 'columns')
        .map((column) => ({ field: column.field, header: column.header ?? column.field }))
        .filter((column): column is { field: string; header: unknown } => typeof column.field === 'string')
        .map((column) => ({ field: column.field, header: typeof column.header === 'string' ? column.header : column.field }));
    const columns = named.length > 0 ? named : stringArrayProperty(element, 'columns').map((field) => ({ field, header: field }));

    return (
        <TreeTable data-scene-id={element.id} value={nodes}>
            {columns.map((column, index) => (
                <Column key={column.field} field={column.field} header={column.header} expander={index === 0} />
            ))}
        </TreeTable>
    );
}
