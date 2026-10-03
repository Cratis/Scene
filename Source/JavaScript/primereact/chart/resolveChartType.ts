// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';
import { ChartType } from './ChartType';
import { ChartTypeResolution } from './ChartTypeResolution';

/**
 * The ordinals of the original .NET `PrimeReact.Charts.ChartType` enum, in declaration order
 * (`Studio/Source/PrimeReact/Charts/Chart.cs`). Migrated documents keep the ordinal, so the position of
 * each entry here is part of the stored-data contract and must never be reordered.
 */
export const legacyChartTypes: readonly ChartType[] = [
    ChartType.Bar,
    ChartType.Line,
    ChartType.Pie,
    ChartType.Doughnut,
    ChartType.PolarArea,
    ChartType.Radar,
    ChartType.Bubble,
    ChartType.Scatter,
];

/**
 * Resolves an authored chart type to the Chart.js vocabulary.
 *
 * Three forms are accepted, and the stored value is never rewritten:
 * - a canonical Chart.js name from {@link ChartType} (`'polarArea'`), which new documents use;
 * - the ordinal of the original .NET enum (`4`), which migrated documents carry;
 * - the .NET member name in its original Pascal case (`'PolarArea'`), which a JSON serialization of that
 *   enum produces.
 *
 * Anything else - an unknown or fractional ordinal, a numeric string, a differently cased name, `null` -
 * resolves to a finding with a message, because the right chart cannot be known. An absent `type` is the
 * one default: the original control defaulted to `Bar`.
 */
export function resolveChartType(element: SceneElement): ChartTypeResolution {
    const value = element.properties.type;
    if (value === undefined) return { isValid: true, type: ChartType.Bar };

    if (typeof value === 'number') {
        const type = Number.isInteger(value) ? legacyChartTypes[value] : undefined;
        return type === undefined ? unsupported(value) : { isValid: true, type };
    }

    if (typeof value === 'string') {
        if (Object.values(ChartType).includes(value as ChartType)) return { isValid: true, type: value as ChartType };
        if (Object.hasOwn(ChartType, value)) return { isValid: true, type: ChartType[value as keyof typeof ChartType] };
    }

    return unsupported(value);
}

function unsupported(value: unknown): ChartTypeResolution {
    const shown = typeof value === 'string' ? `'${value}'` : JSON.stringify(value) ?? String(value);
    return {
        isValid: false,
        value,
        message: `Unsupported chart type ${shown}. Use one of ${Object.values(ChartType).join(', ')}, or a legacy ordinal from 0 to ${legacyChartTypes.length - 1}.`,
    };
}
