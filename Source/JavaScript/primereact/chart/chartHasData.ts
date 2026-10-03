// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Whether chart data holds at least one data point to draw.
 *
 * Datasets whose `data` is empty (or absent) draw nothing but axes, so the chart reports it instead.
 * A dataset may also give its points as keyed records (Chart.js `parsing` over an object), which counts
 * when it has any keys.
 */
export function chartHasData(data: unknown): boolean {
    if (data === null || typeof data !== 'object') return false;
    const datasets = (data as Record<string, unknown>).datasets;
    if (!Array.isArray(datasets)) return false;

    return datasets.some(dataset => {
        if (dataset === null || typeof dataset !== 'object') return false;
        const points = (dataset as Record<string, unknown>).data;
        if (Array.isArray(points)) return points.length > 0;
        return points !== null && typeof points === 'object' && Object.keys(points).length > 0;
    });
}
