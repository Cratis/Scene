// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { vi } from 'vitest';
import { Control, ExternalComponent, HorizontalAlignment, VerticalAlignment, Visibility } from '@cratis/scene.model';
import { PrimeChart } from '../chart/PrimeChart';
import { chartType } from '../chart/resolveChartType';

const destroy = vi.fn();
const Chart = vi.fn<(target: HTMLCanvasElement, configuration: unknown) => { destroy(): void }>(function () { return { destroy }; });

function control(): Control {
    return {
        id: 'chart', name: 'Sales', properties: {}, visibility: Visibility.Visible, isEnabled: true, opacity: 1,
        size: { width: 320, height: 180 }, zIndex: 0, minimumSize: {}, maximumSize: {}, margin: { left: 0, top: 0, right: 0, bottom: 0 },
        horizontalAlignment: HorizontalAlignment.Stretch, verticalAlignment: VerticalAlignment.Stretch,
        borderThickness: { left: 0, top: 0, right: 0, bottom: 0 }, padding: { left: 0, top: 0, right: 0, bottom: 0 }, tabIndex: 0,
    };
}

vi.mock('chart.js/auto', () => ({ default: Chart }));

function chart(properties: Record<string, unknown>): ExternalComponent {
    return { ...control(), componentName: 'PrimeReact:chart', properties, slots: {} };
}

describe('when rendering a chart', () => {
    beforeEach(() => {
        Chart.mockClear();
        destroy.mockClear();
    });

    it('should map the legacy numeric type without rewriting the element', () => {
        const element = chart({ type: 3 });
        chartType(element).should.equal('doughnut');
        JSON.stringify(element.properties.type).should.equal('3');
    });

    it('should retain a canonical string type', () => {
        chartType(chart({ type: 'scatter' })).should.equal('scatter');
    });

    it('should render a canvas without browser globals during server rendering', () => {
        const markup = renderToStaticMarkup(<PrimeChart element={chart({ data: { datasets: [] } })} slots={{}} />);
        markup.should.contain('canvas');
        markup.should.contain('aria-label="Sales"');
    });

    it('should mount Chart.js with the authored data and responsive option', async () => {
        const data = { labels: ['January'], datasets: [{ data: [12] }] };
        render(<PrimeChart element={chart({ type: 'line', data, options: { maintainAspectRatio: false }, responsive: false })} slots={{}} />);

        await vi.waitFor(() => Chart.mock.calls.length.should.equal(1));
        const configuration = Chart.mock.calls[0]![1] as { data: { labels: string[] } };
        JSON.stringify(configuration).should.equal(JSON.stringify({ type: 'line', data, options: { responsive: false, maintainAspectRatio: false } }));
        configuration.data.labels.push('April');
        data.labels.should.deep.equal(['January']);
    });

    it('should destroy the old chart before configuration changes and unmounting', async () => {
        const rendered = render(<PrimeChart element={chart({ data: { datasets: [] } })} slots={{}} />);
        await vi.waitFor(() => Chart.mock.calls.length.should.equal(1));

        rendered.rerender(<PrimeChart element={chart({ data: { datasets: [{ data: [3] }] } })} slots={{}} />);
        await vi.waitFor(() => Chart.mock.calls.length.should.equal(2));
        destroy.mock.calls.length.should.equal(1);

        rendered.unmount();
        destroy.mock.calls.length.should.equal(2);
    });
});
