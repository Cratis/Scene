// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { ArcRuntimeBoundary, BindingKind, MissingBinding, resolveElementBinding } from '../bindings';
import { booleanProperty, stringArrayProperty, stringProperty } from '../properties';

const DataPage = lazy(async () => ({ default: (await import('@cratis/components/DataPage')).DataPage }));

/**
 * The `Cratis.Components:dataPage` component - `DataPage` from `@cratis/components/DataPage`.
 *
 * The library's whole list-screen composite in one name: title bar, menubar, filterable table and
 * optional details pane, all driven from a single query. It is the single highest-leverage thing this
 * package exposes, because reproducing it out of `table` and `toolbar` in a screen would be pages of
 * modeling for a worse result.
 *
 * The `query` property names an Arc query proxy; the columns and menu items come from the `content`
 * slot as `DataPage.Columns` / `DataPage.MenuItems` children.
 */
export function SceneDataPage({ element, slots }: RegisteredComponentProps) {
    const { name, target } = resolveElementBinding(element, BindingKind.Query);
    if (!target) return <MissingBinding element={element} kind={BindingKind.Query} name={name} />;

    return (
        <ArcRuntimeBoundary>
            <DataPage
                title={stringProperty(element.properties, 'title') ?? ''}
                query={target}
                emptyMessage={stringProperty(element.properties, 'emptyMessage') ?? ''}
                dataKey={stringProperty(element.properties, 'dataKey')}
                globalFilterFields={stringArrayProperty(element.properties, 'globalFilterFields')}
                clientFiltering={booleanProperty(element.properties, 'clientFiltering')}
            >
                {slots.content}
            </DataPage>
        </ArcRuntimeBoundary>
    );
}
