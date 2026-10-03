// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RefObject, useEffect, useState } from 'react';
import type { ChartConfiguration } from 'chart.js';

/**
 * Draws a Chart.js chart on a canvas and owns its lifetime.
 *
 * Chart.js loads only after the canvas has mounted, which keeps server rendering independent of browser
 * globals. The chart is destroyed before it is rebuilt and when the component unmounts - Chart.js owns
 * listeners and resize observers, so a retained instance would draw twice and leak them.
 *
 * A chart that cannot be drawn is reported rather than left as a blank canvas: `chart.js` not being
 * installed (it is an optional peer dependency), a failed dynamic import and a rejected configuration all
 * come back as the returned failure message. A rejected configuration is released from the canvas as well,
 * so correcting it draws again on the same canvas.
 *
 * @param canvas The canvas to draw on. It must be rendered whenever `enabled` is true.
 * @param configuration The Chart.js configuration. Pass a structurally stable value (see
 * {@link useStructuralValue}); a new identity rebuilds the chart.
 * @param enabled Whether there is something to draw.
 * @returns The reason the chart could not be drawn, or `undefined`.
 */
export function useChart(canvas: RefObject<HTMLCanvasElement | null>, configuration: ChartConfiguration, enabled: boolean): string | undefined {
    const [failure, setFailure] = useState<string | undefined>(undefined);

    useEffect(() => {
        setFailure(undefined);
        const target = canvas.current;
        if (!enabled || target === null) return undefined;

        let disposed = false;
        let instance: { destroy(): void } | undefined;

        const create = async () => {
            let chartType: typeof import('chart.js/auto').default | undefined;
            try {
                chartType = (await import('chart.js/auto')).default;
                if (disposed) return;
                instance = new chartType(target, structuredClone(configuration));
            } catch (error) {
                // Chart.js registers a chart on its canvas before the constructor finishes, so a constructor
                // that throws still leaves a registered instance behind - one `instance` never points at. Left
                // alone it makes every later attempt fail with "Canvas is already in use" and hides the real
                // reason, so release whatever is bound to this canvas before reporting.
                chartType?.getChart(target)?.destroy();
                if (!disposed) setFailure(error instanceof Error ? error.message : String(error));
            }
        };

        void create();
        return () => {
            disposed = true;
            instance?.destroy();
            instance = undefined;
        };
    }, [canvas, configuration, enabled]);

    return failure;
}
