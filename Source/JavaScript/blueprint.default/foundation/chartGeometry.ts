// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** The kinds of chart the wrapper draws (spec Part B 2.3: line, bar, stacked, donut, funnel). */
export enum ChartKind {
    Line = 'line',
    Bar = 'bar',
    Stacked = 'stacked',
    Donut = 'donut',
    Funnel = 'funnel',
}

/** One named series of values, one per category. */
export interface ChartSeries {
    name: string;
    values: number[];
}

/** A rounded-up axis maximum and the tick values below it, so an axis reads 0, 25, 50, 75, 100 and not 0, 23.4, 46.8. */
export interface ChartScale {
    maximum: number;
    ticks: number[];
}

/** Builds a scale from zero to a rounded-up maximum of the values, in about `target` steps. */
export function niceScale(maximum: number, target = 4): ChartScale {
    if (!Number.isFinite(maximum) || maximum <= 0) return { maximum: 1, ticks: [0, 1] };

    const rough = maximum / target;
    const magnitude = 10 ** Math.floor(Math.log10(rough));
    const residual = rough / magnitude;
    const step = (residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10) * magnitude;
    const top = Math.ceil(maximum / step) * step;
    const ticks: number[] = [];
    for (let tick = 0; tick <= top + step / 2; tick += step) ticks.push(Number(tick.toFixed(10)));
    return { maximum: top, ticks };
}

/** Reads series out of a property value, dropping anything that is not a named list of numbers, so a half-bound chart draws what it has. */
export function readSeries(value: unknown): ChartSeries[] {
    if (!Array.isArray(value)) return [];

    return value.flatMap((entry): ChartSeries[] => {
        if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) return [];
        const { name, values } = entry as Record<string, unknown>;
        if (typeof name !== 'string' || !Array.isArray(values)) return [];
        return [{ name, values: values.map(item => (typeof item === 'number' && Number.isFinite(item) ? item : 0)) }];
    });
}

/** The extent of the values a chart of this kind has to fit: stacked series add up, the others are compared one by one. */
export function dataMaximum(kind: ChartKind, series: ChartSeries[], categoryCount: number): number {
    if (kind === ChartKind.Stacked) {
        return Math.max(0, ...Array.from({ length: categoryCount }, (_, index) => series.reduce((sum, item) => sum + Math.max(0, item.values[index] ?? 0), 0)));
    }

    return Math.max(0, ...series.flatMap(item => item.values));
}

/** A slice of a donut, in radians clockwise from the top. */
export interface DonutSlice {
    index: number;
    value: number;
    share: number;
    start: number;
    end: number;
}

/** Divides the positive values into slices that together make one turn. */
export function donutSlices(values: number[]): DonutSlice[] {
    const positive = values.map(value => Math.max(0, value));
    const total = positive.reduce((sum, value) => sum + value, 0);
    if (total === 0) return [];

    let angle = 0;
    return positive.flatMap((value, index) => {
        if (value === 0) return [];
        const share = value / total;
        const slice = { index, value, share, start: angle, end: angle + share * Math.PI * 2 };
        angle = slice.end;
        return [slice];
    });
}

/** The SVG path of a ring segment between two radii; a full turn is drawn as two halves, because one arc cannot start and end on the same point. */
export function ringPath(centerX: number, centerY: number, outer: number, inner: number, start: number, end: number): string {
    const point = (radius: number, angle: number) => `${(centerX + radius * Math.sin(angle)).toFixed(2)} ${(centerY - radius * Math.cos(angle)).toFixed(2)}`;
    if (end - start >= Math.PI * 2 - 1e-6) {
        const middle = start + Math.PI;
        return `${ringPath(centerX, centerY, outer, inner, start, middle)} ${ringPath(centerX, centerY, outer, inner, middle, end)}`;
    }

    const large = end - start > Math.PI ? 1 : 0;
    return `M ${point(outer, start)} A ${outer} ${outer} 0 ${large} 1 ${point(outer, end)} L ${point(inner, end)} A ${inner} ${inner} 0 ${large} 0 ${point(inner, start)} Z`;
}

/** One stage of a funnel: a centered bar whose width is its share of the widest stage. */
export interface FunnelStage {
    index: number;
    value: number;
    widthRatio: number;
}

/** Sizes the stages of a funnel against the largest value. */
export function funnelStages(values: number[]): FunnelStage[] {
    const maximum = Math.max(0, ...values);
    return values.map((value, index) => ({ index, value, widthRatio: maximum === 0 ? 0 : Math.max(0, value) / maximum }));
}
