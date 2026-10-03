// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CSSProperties, useMemo, useRef } from 'react';
import type { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, recordProperty, stringProperty } from '../properties';
import { useStructuralValue } from '../useStructuralValue';
import { chartHasData } from './chartHasData';
import { resolveChartType } from './resolveChartType';
import { useChart } from './useChart';

/**
 * The `PrimeReact:chart` component, rendered by Chart.js because PrimeReact 11 no longer ships its
 * former Chart.js wrapper.
 *
 * Three states are explicit rather than a blank canvas: an unsupported `type` is reported (the right chart
 * cannot be guessed), a chart with no data points shows its `emptyLabel` (data is never invented), and a
 * chart Chart.js could not draw says why. Only a chart with data and a supported type reaches Chart.js.
 *
 * Chart.js is an optional peer dependency of this package: a host that renders charts must install
 * `chart.js` itself. The chart rebuilds only when its resolved type, data or options change in content -
 * every edit to a Scene document clones the whole document, and a clone with equal content is not a change.
 *
 * The chart fills the authored size: `maintainAspectRatio` defaults to `false` here (Chart.js defaults to
 * `true`, which shrinks the chart inside its box) and an authored `options.maintainAspectRatio` wins. The
 * `responsive` property is authoritative over `options.responsive` when both are set.
 */
export function PrimeChart({ element, interactions }: RegisteredComponentProps) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const resolution = resolveChartType(element);
    const data = useStructuralValue(recordProperty(element, 'data') as ChartData | undefined);
    const options = useStructuralValue(recordProperty(element, 'options') as ChartOptions | undefined);
    const style = recordProperty(element, 'style') as CSSProperties | undefined;
    const responsive = booleanProperty(element, 'responsive', options?.responsive ?? true);
    const ariaLabel = stringProperty(element, 'ariaLabel', element.name || 'Chart');
    const emptyLabel = stringProperty(element, 'emptyLabel', 'No chart data');
    const hasData = chartHasData(data);
    const type = resolution.isValid ? resolution.type : undefined;
    const enabled = type !== undefined && hasData;

    const configuration = useMemo(() => ({
        type,
        data: data ?? { datasets: [] },
        options: { maintainAspectRatio: false, ...options, responsive },
    }) as unknown as ChartConfiguration, [type, data, options, responsive]);

    const failure = useChart(canvas, configuration, enabled);

    return (
        <div
            data-scene-id={element.id}
            data-scene-component='chart'
            style={{ position: 'relative', width: element.size.width ?? '100%', height: element.size.height ?? '100%', ...style }}
            {...interactions}>
            {!resolution.isValid && <div role='alert' data-scene-state='unsupported-type'>{resolution.message}</div>}
            {resolution.isValid && !hasData && <div role='status' data-scene-state='empty'>{emptyLabel}</div>}
            {failure !== undefined && <div role='alert' data-scene-state='unavailable'>{`The chart could not be drawn: ${failure}`}</div>}
            {enabled && <canvas ref={canvas} role='img' aria-label={ariaLabel} hidden={failure !== undefined} />}
        </div>
    );
}
