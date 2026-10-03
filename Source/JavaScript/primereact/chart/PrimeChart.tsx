// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CSSProperties, useEffect, useRef } from 'react';
import type { Chart as ChartInstance, ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, recordProperty, stringProperty } from '../properties';
import { chartType } from './resolveChartType';

/**
 * The `PrimeReact:chart` component, rendered by Chart.js because PrimeReact 11 no longer ships its
 * former Chart.js wrapper.
 *
 * Chart.js loads only after a canvas has mounted, keeping server rendering independent of browser globals.
 * Every configuration change destroys the old Chart.js instance before mounting the new one; Chart.js owns
 * listeners and resize observers, so retaining an old instance would draw twice and leak those resources.
 */
export function PrimeChart({ element, interactions }: RegisteredComponentProps) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const instance = useRef<ChartInstance | undefined>(undefined);
    const type = chartType(element);
    const data = recordProperty(element, 'data') as ChartData | undefined;
    const options = recordProperty(element, 'options') as ChartOptions | undefined;
    const responsive = booleanProperty(element, 'responsive', true);
    const style = recordProperty(element, 'style') as CSSProperties | undefined;
    const ariaLabel = stringProperty(element, 'ariaLabel', element.name || 'Chart');

    useEffect(() => {
        let disposed = false;
        const target = canvas.current;
        if (target === null) return undefined;

        const create = async () => {
            const { default: Chart } = await import('chart.js/auto');
            if (disposed) return;

            instance.current?.destroy();
            const configuration = structuredClone({
                type,
                data: data ?? { datasets: [] },
                options: { responsive, ...options },
            }) as unknown as ChartConfiguration;
            instance.current = new Chart(target, configuration);
        };

        void create();
        return () => {
            disposed = true;
            instance.current?.destroy();
            instance.current = undefined;
        };
    }, [type, data, options, responsive]);

    return (
        <div
            data-scene-id={element.id}
            data-scene-component='chart'
            style={{ width: element.size.width ?? '100%', height: element.size.height ?? '100%', ...style }}
            {...interactions}>
            <canvas ref={canvas} role='img' aria-label={ariaLabel} />
        </div>
    );
}
