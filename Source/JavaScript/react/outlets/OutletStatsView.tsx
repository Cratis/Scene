// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EffectiveOutlet } from '@cratis/scene.engine';
import { OutletItemKind, OutletStat, QueryFieldReference } from '@cratis/scene.model';
import { useRenderBindingScope } from '../renderer';

export interface OutletStatsViewProps {
    /** The resolved outlet of stats. */
    outlet: EffectiveOutlet;

    /** The id of the element that draws the outlet. */
    elementId?: string;
}

/**
 * Reads a field of a single-result query from the query results: the result itself, or the first row when the query
 * returned a list.
 * @param results The query results, by query name.
 * @param reference The query and field.
 * @returns The value, or undefined when the query has no result or the field no value.
 */
export function queryFieldValue(results: Record<string, unknown> | undefined, reference: QueryFieldReference | undefined): unknown {
    if (!reference || !results) return undefined;
    const result = results[reference.query];
    const single = Array.isArray(result) ? result[0] : result;
    if (single === null || typeof single !== 'object') return undefined;
    return (single as Record<string, unknown>)[reference.field];
}

/** The direction a trend value points: up for a positive number, down for a negative one, flat otherwise. */
export function trendDirection(value: unknown): 'up' | 'down' | 'flat' {
    const number = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
    if (Number.isNaN(number) || number === 0) return 'flat';
    return number > 0 ? 'up' : 'down';
}

function display(value: unknown): string {
    if (value === undefined || value === null) return '–';
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

/**
 * Draws an outlet of stats: each stat's label, its value from a field of a single-result query (`valueFrom`), and its
 * trend when it has one. A stat whose query has no result yet shows a dash.
 */
export function OutletStatsView({ outlet, elementId }: OutletStatsViewProps) {
    const scope = useRenderBindingScope();
    const stats = outlet.items.map(entry => entry.item).filter((item): item is OutletStat => item.kind === OutletItemKind.Stat);

    return <dl aria-label={outlet.name} data-scene-outlet={outlet.name} data-scene-outlet-kind={outlet.kind} data-scene-id={elementId} className='scene-outlet scene-outlet-stats'>
        {stats.map(stat => {
            const value = queryFieldValue(scope.queryResults, stat.valueFrom);
            const trend = stat.trend ? queryFieldValue(scope.queryResults, stat.trend) : undefined;
            return <div key={stat.id} data-scene-outlet-item={stat.id} className='scene-outlet-stat'>
                <dt className='scene-outlet-stat-label'>{stat.title}</dt>
                <dd className='scene-outlet-stat-value' data-scene-query={stat.valueFrom?.query} data-scene-query-field={stat.valueFrom?.field}>{display(value)}</dd>
                {stat.trend && <dd className='scene-outlet-stat-trend' data-scene-trend={trendDirection(trend)}>{display(trend)}</dd>}
            </div>;
        })}
    </dl>;
}
