// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { vi } from 'vitest';
import { ExternalComponent } from '@cratis/scene.model';
import { PrimeChart } from '../chart/PrimeChart';
import { sceneComponent } from '../storyElements';

const { Chart, destroy } = vi.hoisted(() => {
    const destroy = vi.fn();
    return { destroy, Chart: vi.fn<(target: HTMLCanvasElement, configuration: unknown) => { destroy(): void }>(function () { return { destroy }; }) };
});

vi.mock('chart.js/auto', () => ({ default: Chart }));

const sales = { labels: ['January'], datasets: [{ data: [12] }] };

function chart(properties: Record<string, unknown>): ExternalComponent {
    return { ...sceneComponent('chart', 'chart', properties), name: 'Sales', size: { width: 320, height: 180 } };
}

function configurationOf(call: number): { type: string; data: unknown; options: Record<string, unknown> } {
    return Chart.mock.calls[call]![1] as { type: string; data: unknown; options: Record<string, unknown> };
}

describe('when rendering a chart', () => {
    beforeEach(() => {
        Chart.mockClear();
        destroy.mockClear();
    });

    describe('and it has data', () => {
        it('should render a canvas without browser globals during server rendering', () => {
            const markup = renderToStaticMarkup(<PrimeChart element={chart({ data: sales })} slots={{}} />);
            markup.should.contain('canvas').and.contain('aria-label="Sales"');
        });

        it('should mount Chart.js with the authored type and data', async () => {
            render(<PrimeChart element={chart({ type: 'line', data: sales })} slots={{}} />);
            await vi.waitFor(() => Chart.mock.calls.length.should.equal(1));
            JSON.stringify([configurationOf(0).type, configurationOf(0).data]).should.equal(JSON.stringify(['line', sales]));
        });

        it('should give Chart.js a copy, so the authored data is never mutated', async () => {
            const data = structuredClone(sales);
            render(<PrimeChart element={chart({ data })} slots={{}} />);
            await vi.waitFor(() => Chart.mock.calls.length.should.equal(1));
            (configurationOf(0).data as typeof sales).labels.push('April');
            data.labels.should.deep.equal(['January']);
        });

        it('should fill the authored size by default instead of keeping the chart aspect ratio', async () => {
            render(<PrimeChart element={chart({ data: sales })} slots={{}} />);
            await vi.waitFor(() => Chart.mock.calls.length.should.equal(1));
            configurationOf(0).options.should.deep.equal({ maintainAspectRatio: false, responsive: true });
        });

        it('should keep an aspect ratio the document asks for', async () => {
            render(<PrimeChart element={chart({ data: sales, options: { maintainAspectRatio: true } })} slots={{}} />);
            await vi.waitFor(() => Chart.mock.calls.length.should.equal(1));
            configurationOf(0).options.maintainAspectRatio!.should.equal(true);
        });

        it('should let the responsive property decide over the same option', async () => {
            render(<PrimeChart element={chart({ data: sales, responsive: false, options: { responsive: true } })} slots={{}} />);
            await vi.waitFor(() => Chart.mock.calls.length.should.equal(1));
            configurationOf(0).options.responsive!.should.equal(false);
        });

        it('should fall back to the responsive option when the property is not set', async () => {
            render(<PrimeChart element={chart({ data: sales, options: { responsive: false } })} slots={{}} />);
            await vi.waitFor(() => Chart.mock.calls.length.should.equal(1));
            configurationOf(0).options.responsive!.should.equal(false);
        });

        it('should render the authored size and accessible name', () => {
            const { container, getByRole } = render(<PrimeChart element={chart({ data: sales, ariaLabel: 'Monthly sales' })} slots={{}} />);
            const surface = container.querySelector('[data-scene-component="chart"]') as HTMLElement;
            [surface.style.width, surface.style.height, getByRole('img').getAttribute('aria-label')].should.deep.equal(['320px', '180px', 'Monthly sales']);
        });
    });

    describe('and the document is edited', () => {
        it('should keep the chart when a document clone brings structurally equal data and options', async () => {
            const properties = { type: 'bar', data: sales, options: { plugins: { legend: { display: false } } } };
            const rendered = render(<PrimeChart element={chart(structuredClone(properties))} slots={{}} />);
            await vi.waitFor(() => Chart.mock.calls.length.should.equal(1));

            rendered.rerender(<PrimeChart element={chart(structuredClone(properties))} slots={{}} />);
            rendered.rerender(<PrimeChart element={chart(structuredClone(properties))} slots={{}} />);
            await new Promise(resolve => setTimeout(resolve, 20));
            [Chart.mock.calls.length, destroy.mock.calls.length].should.deep.equal([1, 0]);
        });

        it('should rebuild the chart once when its data changes in content', async () => {
            const rendered = render(<PrimeChart element={chart({ data: sales })} slots={{}} />);
            await vi.waitFor(() => Chart.mock.calls.length.should.equal(1));

            rendered.rerender(<PrimeChart element={chart({ data: { labels: ['January'], datasets: [{ data: [99] }] } })} slots={{}} />);
            await vi.waitFor(() => Chart.mock.calls.length.should.equal(2));
            destroy.mock.calls.length.should.equal(1);
        });

        it('should rebuild the chart when its type changes', async () => {
            const rendered = render(<PrimeChart element={chart({ type: 'bar', data: sales })} slots={{}} />);
            await vi.waitFor(() => Chart.mock.calls.length.should.equal(1));

            rendered.rerender(<PrimeChart element={chart({ type: 3, data: sales })} slots={{}} />);
            await vi.waitFor(() => Chart.mock.calls.length.should.equal(2));
            configurationOf(1).type.should.equal('doughnut');
        });

        it('should destroy the chart when it unmounts', async () => {
            const rendered = render(<PrimeChart element={chart({ data: sales })} slots={{}} />);
            await vi.waitFor(() => Chart.mock.calls.length.should.equal(1));
            rendered.unmount();
            destroy.mock.calls.length.should.equal(1);
        });

        it('should never create a chart that unmounted before Chart.js finished loading', async () => {
            const rendered = render(<PrimeChart element={chart({ data: sales })} slots={{}} />);
            rendered.unmount();
            await new Promise(resolve => setTimeout(resolve, 20));
            Chart.mock.calls.length.should.equal(0);
        });
    });

    describe('and it has no data', () => {
        for (const [description, properties] of [
            ['no data at all, as a migrated chart has', { type: 0 }],
            ['datasets that are empty', { data: { labels: [], datasets: [] } }],
            ['a dataset without points', { data: { labels: ['A'], datasets: [{ data: [] }] } }],
        ] as [string, Record<string, unknown>][]) {
            describe(`because it has ${description}`, () => {
                it('should say so instead of drawing a blank canvas', () => {
                    const { getByRole } = render(<PrimeChart element={chart(properties)} slots={{}} />);
                    getByRole('status').textContent!.should.equal('No chart data');
                });

                it('should not draw a canvas or load Chart.js', async () => {
                    const { container } = render(<PrimeChart element={chart(properties)} slots={{}} />);
                    await new Promise(resolve => setTimeout(resolve, 20));
                    [container.querySelector('canvas') === null, Chart.mock.calls.length].should.deep.equal([true, 0]);
                });
            });
        }

        it('should use the authored empty label', () => {
            const { getByRole } = render(<PrimeChart element={chart({ emptyLabel: 'Nothing to show yet' })} slots={{}} />);
            getByRole('status').textContent!.should.equal('Nothing to show yet');
        });

        it('should draw once data arrives', async () => {
            const rendered = render(<PrimeChart element={chart({})} slots={{}} />);
            rendered.rerender(<PrimeChart element={chart({ data: sales })} slots={{}} />);
            await vi.waitFor(() => Chart.mock.calls.length.should.equal(1));
        });
    });

    describe('and its type is not supported', () => {
        it('should report the finding and draw nothing', async () => {
            const { getByRole, container } = render(<PrimeChart element={chart({ type: 'PolarArea ', data: sales })} slots={{}} />);
            await new Promise(resolve => setTimeout(resolve, 20));
            [getByRole('alert').textContent!.includes("Unsupported chart type 'PolarArea '"), container.querySelector('canvas') === null, Chart.mock.calls.length]
                .should.deep.equal([true, true, 0]);
        });
    });
});
