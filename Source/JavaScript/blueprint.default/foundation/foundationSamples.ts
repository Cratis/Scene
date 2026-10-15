// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent } from '@cratis/scene.model';
import { componentRegistryKey } from '@cratis/scene.react';
import { ComponentName } from '../ComponentName';
import { defaultBlueprintName } from '../packageName';
import { ComponentState } from './ComponentState';

/**
 * What a story or a specification feeds each foundation component to see it populated.
 *
 * These are design-time and test-time values, never part of what a component is: a component declares the shape of its data
 * and a screen binds it to a query (spec SD1). The domain blueprints supply real preview data as sample-data packs; this is
 * only enough to draw each component in each state.
 */
export interface FoundationSample {
    /** The properties that make the component populated. */
    properties: Record<string, unknown>;

    /** Text that only appears when the component shows its data, so a specification can prove the no-permission state shows none of it. */
    data: string[];

    /** Whether the component shows data and so owns the five standard states; chips and the empty state themselves do not. */
    stateful: boolean;
}

export const foundationSamples: Record<string, FoundationSample> = {
    [ComponentName.EmptyState]: { properties: { headline: 'No invoices yet', hint: 'Invoices you create appear here.', icon: 'file', actionLabel: 'New invoice' }, data: [], stateful: false },
    [ComponentName.StatCard]: { properties: { label: 'Open pipeline', value: 1234567, format: 'currency', currency: 'USD', change: 12.5, comparison: 'last month', locale: 'en-US' }, data: ['$1,234,567'], stateful: true },
    [ComponentName.TrendChip]: { properties: { change: -3.2, goodDirection: 'down', comparison: 'last week', locale: 'en-US' }, data: [], stateful: false },
    [ComponentName.StatusChip]: { properties: { status: 'Awaiting approval', tone: 'warning' }, data: [], stateful: false },
    [ComponentName.ChartWrapper]: {
        properties: { title: 'Revenue by quarter', kind: 'line', categories: ['Q1', 'Q2', 'Q3', 'Q4'], series: [{ name: 'Revenue', values: [120, 180, 150, 240] }, { name: 'Target', values: [100, 150, 200, 220] }], locale: 'en-US' },
        data: ['Revenue by quarter'], stateful: true,
    },
    [ComponentName.FilterBuilder]: {
        properties: {
            fields: [{ name: 'owner', label: 'Owner', type: 'text' }, { name: 'status', label: 'Status', type: 'select', options: ['Open', 'Won', 'Lost'] }, { name: 'value', label: 'Value', type: 'number' }],
            filter: { operator: 'and', conditions: [{ field: 'status', operator: 'is', value: 'Open' }, { field: 'owner', operator: 'contains', value: 'Ada' }], groups: [] },
        },
        data: ['2 active filters'], stateful: true,
    },
    [ComponentName.ColumnChooser]: {
        properties: { columns: [{ id: 'name', label: 'Name', locked: true }, { id: 'owner', label: 'Owner' }, { id: 'status', label: 'Status', visible: false }] },
        data: ['3 shown'], stateful: true,
    },
    [ComponentName.SavedViewsMenu]: {
        properties: { views: [{ id: 'all', label: 'All leads' }, { id: 'mine', label: 'Mine' }, { id: 'overdue', label: 'Overdue' }], activeView: 'mine' },
        data: ['Mine'], stateful: true,
    },
};

/** A scene element for a foundation component, populated with its sample unless properties are given, with the state forced when asked. */
export function foundationElement(name: string, properties?: Record<string, unknown>, state?: ComponentState): ExternalComponent {
    const sample = foundationSamples[name];
    return {
        id: `${name}-sample`,
        componentName: componentRegistryKey(defaultBlueprintName, name),
        properties: { ...(properties ?? sample?.properties ?? {}), ...(state === undefined ? {} : { state }) },
        slots: {},
    } as unknown as ExternalComponent;
}
