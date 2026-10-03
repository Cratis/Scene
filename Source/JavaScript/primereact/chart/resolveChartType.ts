// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';
import { ChartType } from './ChartType';

const legacyChartTypes: ChartType[] = [
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
 * Stored legacy prototypes used the ordinal of the original .NET `ChartType` enum. The ordinal remains
 * in an element's own `type` property during migration, so this translation happens at the rendering
 * boundary rather than rewriting persisted data. New documents use the stable string values in
 * {@link ChartType}.
 */
export function chartType(element: SceneElement): ChartType {
    const value = element.properties.type;
    if (typeof value === 'number' && Number.isInteger(value)) return legacyChartTypes[value] ?? ChartType.Bar;
    return Object.values(ChartType).includes(value as ChartType) ? value as ChartType : ChartType.Bar;
}
