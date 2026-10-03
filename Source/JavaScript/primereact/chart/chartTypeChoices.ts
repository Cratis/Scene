// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyChoice } from '@cratis/scene.model';
import { ChartType } from './ChartType';
import { legacyChartTypes } from './resolveChartType';

const chartTypeLabels: Record<ChartType, string> = {
    [ChartType.Bar]: 'Bar',
    [ChartType.Line]: 'Line',
    [ChartType.Pie]: 'Pie',
    [ChartType.Doughnut]: 'Doughnut',
    [ChartType.PolarArea]: 'Polar area',
    [ChartType.Radar]: 'Radar',
    [ChartType.Bubble]: 'Bubble',
    [ChartType.Scatter]: 'Scatter',
};

/**
 * The chart type choices: the stable names new documents use, then the ordinals migrated documents carry,
 * then the Pascal case member names of the original .NET enum that a serialized enum produces.
 * A migrated chart stores its original `type`; offering every form the renderer accepts keeps that stored
 * value valid (and its type visible and re-selectable) without rewriting it to another form behind the
 * author's back. The choices are the same set `resolveChartType` accepts, so what the renderer draws is
 * exactly what the descriptor allows.
 */
export const chartTypeChoices: PropertyChoice[] = [
    ...Object.values(ChartType).map(type => ({ value: type, label: chartTypeLabels[type] })),
    ...legacyChartTypes.map((type, ordinal) => ({ value: ordinal, label: `${chartTypeLabels[type]} (legacy ${ordinal})`, description: `The ordinal ${ordinal} of the original chart type enum, as stored by migrated documents.` })),
    ...(Object.keys(ChartType) as (keyof typeof ChartType)[]).map(name => ({ value: name, label: `${chartTypeLabels[ChartType[name]]} (legacy name ${name})`, description: `The member name ${name} of the original chart type enum, as a serialized enum stores it.` })),
];

