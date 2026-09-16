// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { ArcRuntimeBoundary, BindingKind, MissingBinding, resolveElementBinding } from '../bindings';
import { objectProperty, stringArrayProperty, stringProperty } from '../properties';
import { Placeholder } from '../bindings/Placeholder';

const DataTableForQuery = lazy(async () => ({ default: (await import('../bindings/ArcBoundComponents')).BoundDataTable }));

/**
 * The `Cratis.Components:dataTable` component, also registered as `table` - `DataTableForQuery` from
 * `@cratis/components/DataTables`.
 *
 * Registering it under the bare name `table` as well is override priority working as designed: a profile
 * listing `core`, `PrimeReact` and `Cratis.Components` in that order resolves `table` here and records
 * the other two as shadowed. That is the right outcome, because this is a strictly better `table` for a
 * Cratis application - it performs the query, pages against the server, and wires filtering and sorting
 * back into it, where PrimeReact's `DataTable` is handed rows and knows nothing about where they came from.
 *
 * The `query` property names an Arc query proxy; the columns come from the `content` slot.
 * Optional `queryArguments` is an explicit object forwarded unchanged to that proxy. Invalid values
 * render a placeholder rather than accidentally executing a query without its arguments. This remains
 * a collection table; forwarding arguments does not make optional single-result queries compatible.
 *
 * There is deliberately no `clientFiltering` property. `@cratis/components` 3.0.0 still accepts the prop
 * so existing call sites compile, but it no longer does anything - filtering is always applied to the
 * loaded page. Exposing a screen property that reads as a choice and silently is not would be worse than
 * not offering it, so a screen that set it now gets a property-not-recognized signal rather than a
 * setting that quietly stopped mattering.
 */
export function SceneDataTable({ element, slots }: RegisteredComponentProps) {
    const { name, target } = resolveElementBinding(element, BindingKind.Query);
    if (!target) return <MissingBinding element={element} kind={BindingKind.Query} name={name} />;

    const queryArguments = objectProperty(element.properties, 'queryArguments');
    if (element.properties.queryArguments !== undefined && queryArguments === undefined) {
        return <Placeholder element={element} problem='Invalid queryArguments: expected an object' />;
    }

    return (
        <ArcRuntimeBoundary>
            <DataTableForQuery
                query={target}
                {...(queryArguments === undefined ? {} : { queryArguments })}
                emptyMessage={stringProperty(element.properties, 'emptyMessage') ?? ''}
                dataKey={stringProperty(element.properties, 'dataKey')}
                globalFilterFields={stringArrayProperty(element.properties, 'globalFilterFields')}
                className={stringProperty(element.properties, 'className')}
            >
                {slots.content}
            </DataTableForQuery>
        </ArcRuntimeBoundary>
    );
}
