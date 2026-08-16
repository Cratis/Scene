// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { ArcRuntimeBoundary, BindingKind, MissingBinding, resolveElementBinding } from '../bindings';
import { stringArrayProperty, stringProperty } from '../properties';

const DataTableForObservableQuery = lazy(async () => ({
    default: (await import('@cratis/components/DataTables')).DataTableForObservableQuery,
}));

/**
 * The `Cratis.Components:observableDataTable` component - `DataTableForObservableQuery` from
 * `@cratis/components/DataTables`.
 *
 * A separate name rather than a flag on `dataTable`, because the distinction is in the *proxy* a host
 * registers, not in how the table is configured: an observable query opens a WebSocket subscription and
 * re-renders when the server's read model changes, and a plain query does not. A screen that names an
 * observable query here is stating that its data is live, which is a design decision worth being able to
 * read off the screen.
 *
 * As with `dataTable`, no `clientFiltering` property is exposed: `@cratis/components` 3.0.0 keeps the
 * prop for source compatibility but ignores it, and a screen property that cannot change anything is
 * worse than an absent one.
 */
export function SceneObservableDataTable({ element, slots }: RegisteredComponentProps) {
    const { name, target } = resolveElementBinding(element, BindingKind.Query);
    if (!target) return <MissingBinding element={element} kind={BindingKind.Query} name={name} />;

    return (
        <ArcRuntimeBoundary>
            <DataTableForObservableQuery
                query={target}
                emptyMessage={stringProperty(element.properties, 'emptyMessage') ?? ''}
                dataKey={stringProperty(element.properties, 'dataKey')}
                globalFilterFields={stringArrayProperty(element.properties, 'globalFilterFields')}
                className={stringProperty(element.properties, 'className')}
            >
                {slots.content}
            </DataTableForObservableQuery>
        </ArcRuntimeBoundary>
    );
}
