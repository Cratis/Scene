// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { elementNodeId, isExternalComponent } from '@cratis/scene.engine';
import { SceneEditKind, type QueryBinding, type SceneEdit, type SceneElement } from '@cratis/scene.model';
import { childrenOfElement } from '../Selection/sceneTree';
import { isQueryBinding } from '../Binding/queryBindingModel';

export const tableComponentNames = ['dataTable', 'table', 'observableDataTable'];
export const queryProperty = 'query';

export interface QueryTable {
    elementId: string;
    binding: QueryBinding;
}

const bareName = (componentName: string): string => componentName.slice(componentName.lastIndexOf(':') + 1);

// The table an element is: a data table with a query it is bound to.
export function queryTableOf(element: SceneElement): QueryTable | undefined {
    if (!isExternalComponent(element as never)) return undefined;
    const external = element as unknown as { id: string; componentName: string; properties?: Record<string, unknown> };
    const binding = external.properties?.[queryProperty];
    return tableComponentNames.includes(bareName(external.componentName)) && isQueryBinding(binding) ? { elementId: external.id, binding } : undefined;
}

// Every table on the screen that is bound to a query, in the order the screen holds them.
export function queryTablesOf(roots: readonly SceneElement[]): QueryTable[] {
    return roots.flatMap(element => [...(queryTableOf(element) ? [queryTableOf(element)!] : []), ...queryTablesOf(childrenOfElement(element))]);
}

// The edit that gives a table another binding - the columns it shows and what feeds its query.
export const bindingEdit = (elementId: string, binding: QueryBinding): SceneEdit =>
    ({ kind: SceneEditKind.SetProperty, nodeId: elementNodeId(elementId), path: queryProperty, value: binding });
