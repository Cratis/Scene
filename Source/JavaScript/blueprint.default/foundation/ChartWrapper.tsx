// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useId, useRef } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { readOptionalString, readStrings } from '../shell/elementProperties';
import { ChartKind, ChartSeries, dataMaximum, donutSlices, funnelStages, niceScale, readSeries, ringPath } from './chartGeometry';
import { ComponentState, readComponentState } from './ComponentState';
import { formatNumber, NumberFormat, readLocale, readNumberFormat } from './formatting';
import { readFoundationStrings } from './foundationStrings';
import { FoundationFrame } from './StateFrame';
import { useElementWidth } from './useElementWidth';

/** Reads the chart kind, defaulting to a line chart. */
export function readChartKind(value: unknown): ChartKind {
    return (Object.values(ChartKind) as string[]).includes(value as string) ? (value as ChartKind) : ChartKind.Line;
}

/** The theme tokens series are drawn in, in order; a series is never told apart by color alone - see `markers` and `patterns`. */
const seriesColors = ['var(--foundation-primary)', 'var(--foundation-success)', 'var(--foundation-warning)', 'var(--foundation-danger)', 'var(--foundation-info)', 'var(--foundation-muted)'];
const markers = ['circle', 'square', 'triangle', 'diamond', 'cross', 'ring'] as const;
const dashes = ['', '6 3', '2 3', '8 3 2 3', '', '4 4'];
const margin = { top: 12, right: 12, bottom: 28, left: 48 };

type Marker = (typeof markers)[number];

function MarkerShape({ kind, x, y, color }: { kind: Marker; x: number; y: number; color: string }) {
    const r = 4;
    switch (kind) {
        case 'square': return <rect x={x - r} y={y - r} width={r * 2} height={r * 2} fill={color} />;
        case 'triangle': return <polygon points={`${x},${y - r - 1} ${x + r + 1},${y + r} ${x - r - 1},${y + r}`} fill={color} />;
        case 'diamond': return <polygon points={`${x},${y - r - 1} ${x + r + 1},${y} ${x},${y + r + 1} ${x - r - 1},${y}`} fill={color} />;
        case 'cross': return <path d={`M ${x - r} ${y - r} L ${x + r} ${y + r} M ${x + r} ${y - r} L ${x - r} ${y + r}`} stroke={color} strokeWidth={2} fill='none' />;
        case 'ring': return <circle cx={x} cy={y} r={r} fill='none' stroke={color} strokeWidth={2} />;
        default: return <circle cx={x} cy={y} r={r} fill={color} />;
    }
}

interface PlotProps {
    kind: ChartKind;
    categories: string[];
    series: ChartSeries[];
    width: number;
    locale: string;
    format: NumberFormat;
    currency?: string;
}

function CartesianPlot({ kind, categories, series, width, locale, format, currency }: PlotProps) {
    const height = Math.max(180, Math.min(320, Math.round(width * 0.55)));
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const scale = niceScale(dataMaximum(kind, series, categories.length));
    const y = (value: number) => margin.top + plotHeight - (value / scale.maximum) * plotHeight;
    const slot = plotWidth / Math.max(1, categories.length);
    const patternId = useId();
    const label = (value: number) => formatNumber(value, locale, format === NumberFormat.Number ? NumberFormat.Compact : format, currency);

    return (
        <svg className='foundation-chart-plot' viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden='true' focusable='false'>
            <defs>
                {series.map((_, index) => index > 0 && index % 3 !== 0 && (
                    <pattern key={index} id={`${patternId}-${index}`} width='6' height='6' patternUnits='userSpaceOnUse' patternTransform={`rotate(${index % 2 === 0 ? 45 : -45})`}>
                        <rect width='6' height='6' fill={seriesColors[index % seriesColors.length]} opacity='0.35' />
                        <line x1='0' y1='0' x2='0' y2='6' stroke={seriesColors[index % seriesColors.length]} strokeWidth='2.5' />
                    </pattern>
                ))}
            </defs>
            {scale.ticks.map(tick => (
                <g key={tick}>
                    <line className='foundation-chart-grid' x1={margin.left} x2={width - margin.right} y1={y(tick)} y2={y(tick)} />
                    <text className='foundation-chart-tick' x={margin.left - 6} y={y(tick)} textAnchor='end' dominantBaseline='middle'>{label(tick)}</text>
                </g>
            ))}
            {categories.map((category, index) => (
                <text key={category + index} className='foundation-chart-tick' x={margin.left + slot * index + slot / 2} y={height - 8} textAnchor='middle'>{category}</text>
            ))}
            {kind === ChartKind.Line && series.map((item, seriesIndex) => {
                const color = seriesColors[seriesIndex % seriesColors.length];
                const points = categories.map((_, index) => ({ x: margin.left + slot * index + slot / 2, y: y(item.values[index] ?? 0) }));
                return (
                    <g key={item.name}>
                        <polyline points={points.map(point => `${point.x},${point.y}`).join(' ')} fill='none' stroke={color} strokeWidth='2.5' strokeDasharray={dashes[seriesIndex % dashes.length]} />
                        {points.map((point, index) => <MarkerShape key={index} kind={markers[seriesIndex % markers.length]} x={point.x} y={point.y} color={color} />)}
                    </g>
                );
            })}
            {kind === ChartKind.Bar && series.map((item, seriesIndex) => {
                const group = slot * 0.7;
                const bar = group / series.length;
                return (
                    <g key={item.name}>
                        {categories.map((_, index) => {
                            const value = Math.max(0, item.values[index] ?? 0);
                            return <rect key={index} className='foundation-chart-bar' x={margin.left + slot * index + (slot - group) / 2 + bar * seriesIndex} y={y(value)} width={Math.max(1, bar - 2)} height={margin.top + plotHeight - y(value)}
                                fill={fillFor(seriesIndex, patternId)} stroke={seriesColors[seriesIndex % seriesColors.length]} strokeWidth='1.5' />;
                        })}
                    </g>
                );
            })}
            {kind === ChartKind.Stacked && categories.map((_, index) => {
                let base = 0;
                return (
                    <g key={index}>
                        {series.map((item, seriesIndex) => {
                            const value = Math.max(0, item.values[index] ?? 0);
                            const top = y(base + value);
                            const rect = <rect key={item.name} className='foundation-chart-bar' x={margin.left + slot * index + slot * 0.15} y={top} width={slot * 0.7} height={Math.max(0, y(base) - top)}
                                fill={fillFor(seriesIndex, patternId)} stroke={seriesColors[seriesIndex % seriesColors.length]} strokeWidth='1.5' />;
                            base += value;
                            return rect;
                        })}
                    </g>
                );
            })}
        </svg>
    );
}

function fillFor(seriesIndex: number, patternId: string): string {
    return seriesIndex === 0 || seriesIndex % 3 === 0 ? seriesColors[seriesIndex % seriesColors.length] : `url(#${patternId}-${seriesIndex})`;
}

function DonutPlot({ categories, values, width, locale }: { categories: string[]; values: number[]; width: number; locale: string }) {
    const size = Math.max(160, Math.min(280, width));
    const radius = size / 2 - 4;
    const slices = donutSlices(values);
    const patternId = useId();

    return (
        <svg className='foundation-chart-plot' viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden='true' focusable='false'>
            <defs>
                {values.map((_, index) => index > 0 && index % 3 !== 0 && (
                    <pattern key={index} id={`${patternId}-${index}`} width='6' height='6' patternUnits='userSpaceOnUse' patternTransform={`rotate(${index % 2 === 0 ? 45 : -45})`}>
                        <rect width='6' height='6' fill={seriesColors[index % seriesColors.length]} opacity='0.35' />
                        <line x1='0' y1='0' x2='0' y2='6' stroke={seriesColors[index % seriesColors.length]} strokeWidth='2.5' />
                    </pattern>
                ))}
            </defs>
            {slices.map(slice => (
                <path key={slice.index} className='foundation-chart-slice' d={ringPath(size / 2, size / 2, radius, radius * 0.6, slice.start, slice.end)} fill={fillFor(slice.index, patternId)}
                    stroke={seriesColors[slice.index % seriesColors.length]} strokeWidth='1.5' data-share={formatNumber(slice.share * 100, locale, NumberFormat.Percent)}>
                    <title>{`${categories[slice.index] ?? ''}: ${formatNumber(slice.share * 100, locale, NumberFormat.Percent)}`}</title>
                </path>
            ))}
        </svg>
    );
}

function FunnelPlot({ categories, values, width, locale, format, currency }: { categories: string[]; values: number[]; width: number; locale: string; format: NumberFormat; currency?: string }) {
    const stages = funnelStages(values);
    const barHeight = 34;
    const gap = 6;
    const height = stages.length * (barHeight + gap);
    const patternId = useId();

    return (
        <svg className='foundation-chart-plot' viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden='true' focusable='false'>
            <defs>
                {stages.map(stage => stage.index > 0 && stage.index % 3 !== 0 && (
                    <pattern key={stage.index} id={`${patternId}-${stage.index}`} width='6' height='6' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'>
                        <rect width='6' height='6' fill={seriesColors[stage.index % seriesColors.length]} opacity='0.35' />
                        <line x1='0' y1='0' x2='0' y2='6' stroke={seriesColors[stage.index % seriesColors.length]} strokeWidth='2.5' />
                    </pattern>
                ))}
            </defs>
            {stages.map(stage => {
                const stageWidth = Math.max(2, width * stage.widthRatio);
                return (
                    <g key={stage.index}>
                        <rect className='foundation-chart-bar' x={(width - stageWidth) / 2} y={stage.index * (barHeight + gap)} width={stageWidth} height={barHeight} rx='4'
                            fill={fillFor(stage.index, patternId)} stroke={seriesColors[stage.index % seriesColors.length]} strokeWidth='1.5' />
                        <text className='foundation-chart-stage' x={width / 2} y={stage.index * (barHeight + gap) + barHeight / 2} textAnchor='middle' dominantBaseline='middle'>
                            {`${categories[stage.index] ?? ''} · ${formatNumber(stage.value, locale, format, currency)}`}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

/**
 * The `chartWrapper` component: one chart - line, bar, stacked, donut or funnel - drawn as scalable vector graphics from the
 * theme's tokens, with its own title, legend and a data table.
 *
 * `categories` name the points and `series` give a list of values for each. A donut and a funnel draw the first series, one slice or
 * stage per category. The chart is never the only way to read the data: the figure is labelled, the drawing is hidden from assistive
 * technology, and a table of the same numbers follows it - open it with "Chart data". Series are told apart by marker, dash or hatch as
 * well as color, and the legend names each.
 */
export function ChartWrapper({ element, interactions }: RegisteredComponentProps) {
    const kind = readChartKind(element.properties.kind);
    const categories = readStrings(element, 'categories');
    const series = readSeries(element.properties.series);
    const hasData = series.some(item => item.values.length > 0) && categories.length > 0;
    const state = readComponentState(element, hasData);
    const locale = readLocale(element);
    const format = readNumberFormat(element);
    const currency = readOptionalString(element, 'currency');
    const strings = readFoundationStrings(element);
    const container = useRef<HTMLDivElement>(null);
    const width = useElementWidth(container, 480);
    const title = readOptionalString(element, 'title') ?? readOptionalString(element, 'label');
    const first = series[0]?.values ?? [];
    const single = kind === ChartKind.Donut || kind === ChartKind.Funnel;
    const legend = single ? categories.map((name, index) => ({ name, index })) : series.map((item, index) => ({ name: item.name, index }));
    const dataTableId = useId();

    return (
        <FoundationFrame element={{ ...element, properties: { ...element.properties, label: title } }} interactions={interactions} name='chart' state={state} skeleton={[30, 100, 100, 60]}>
            {(state === ComponentState.Ready || state === ComponentState.Partial) && (
                <figure className='foundation-chart-figure' data-kind={kind}>
                    {title && <figcaption className='foundation-chart-title'>{title}</figcaption>}
                    <div ref={container} className='foundation-chart-canvas'>
                        {kind === ChartKind.Donut ? <DonutPlot categories={categories} values={first} width={width} locale={locale} />
                            : kind === ChartKind.Funnel ? <FunnelPlot categories={categories} values={first} width={width} locale={locale} format={format} currency={currency} />
                                : <CartesianPlot kind={kind} categories={categories} series={series} width={width} locale={locale} format={format} currency={currency} />}
                    </div>
                    <ul className='foundation-chart-legend' aria-label={strings.chartSeries}>
                        {legend.map(entry => (
                            <li key={entry.index}>
                                <svg width='14' height='14' viewBox='0 0 14 14' aria-hidden='true'>
                                    {kind === ChartKind.Line ? <MarkerShape kind={markers[entry.index % markers.length]} x={7} y={7} color={seriesColors[entry.index % seriesColors.length]} />
                                        : <rect x='1' y='1' width='12' height='12' fill={seriesColors[entry.index % seriesColors.length]} opacity={entry.index === 0 || entry.index % 3 === 0 ? 1 : 0.5} stroke={seriesColors[entry.index % seriesColors.length]} strokeWidth='2' />}
                                </svg>
                                <span>{entry.name}</span>
                            </li>
                        ))}
                    </ul>
                    <details className='foundation-chart-data'>
                        <summary>{strings.chartDataTable}</summary>
                        <table id={dataTableId}>
                            <caption className='foundation-visually-hidden'>{title ?? strings.chartDataTable}</caption>
                            <thead>
                                <tr><th scope='col'>{strings.chartCategory}</th>{(single ? [{ name: series[0]?.name ?? strings.chartSeries }] : series).map(item => <th key={item.name} scope='col'>{item.name}</th>)}</tr>
                            </thead>
                            <tbody>
                                {categories.map((category, index) => (
                                    <tr key={category + index}>
                                        <th scope='row'>{category}</th>
                                        {(single ? [series[0]] : series).map(item => <td key={item?.name}>{formatNumber(item?.values[index] ?? 0, locale, format, currency)}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </details>
                </figure>
            )}
        </FoundationFrame>
    );
}
