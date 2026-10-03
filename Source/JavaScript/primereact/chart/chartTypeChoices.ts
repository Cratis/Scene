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
 * The chart type choices: the stable names new documents use, then the ordinals migrated documents carry.
 * A migrated chart stores its original numeric `type`; offering those values keeps that stored value valid
 * (and its type visible and re-selectable) without rewriting it to a string behind the author's back.
 */
export const chartTypeChoices: PropertyChoice[] = [
    ...Object.values(ChartType).map(type => ({ value: type, label: chartTypeLabels[type] })),
    ...legacyChartTypes.map((type, ordinal) => ({ value: ordinal, label: `${chartTypeLabels[type]} (legacy ${ordinal})`, description: `The ordinal ${ordinal} of the original chart type enum, as stored by migrated documents.` })),
];

