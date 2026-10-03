// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { PrimeChart } from '../chart/PrimeChart';
import { sceneComponent } from '../storyElements';

const { Chart } = vi.hoisted(() => ({ Chart: vi.fn<(target: HTMLCanvasElement, configuration: unknown) => { destroy(): void }>() }));

vi.mock('chart.js/auto', () => ({ default: Chart }));

const sales = { labels: ['January'], datasets: [{ data: [12] }] };

describe('when Chart.js fails to draw a chart', () => {
    const unhandled: unknown[] = [];
    const record = (reason: unknown) => unhandled.push(reason);

    beforeEach(() => {
        unhandled.length = 0;
        process.on('unhandledRejection', record);
    });

    afterEach(() => {
        process.off('unhandledRejection', record);
    });

    it('should report the reason instead of leaving a blank canvas', async () => {
        Chart.mockImplementation(function () { throw new Error('Canvas is already in use'); });
        const { findByRole } = render(<PrimeChart element={sceneComponent('chart', 'chart', { data: sales })} slots={{}} />);
        (await findByRole('alert')).textContent!.should.equal('The chart could not be drawn: Canvas is already in use');
    });

    it('should not leave an unhandled rejection behind', async () => {
        Chart.mockImplementation(function () { throw new Error('boom'); });
        const { findByRole } = render(<PrimeChart element={sceneComponent('chart', 'chart', { data: sales })} slots={{}} />);
        await findByRole('alert');
        await new Promise(resolve => setTimeout(resolve, 20));
        unhandled.length.should.equal(0);
    });

    it('should draw again once the configuration changes after a failure', async () => {
        const destroy = vi.fn();
        Chart.mockImplementationOnce(function () { throw new Error('boom'); });
        Chart.mockImplementation(function () { return { destroy }; });
        const rendered = render(<PrimeChart element={sceneComponent('chart', 'chart', { data: sales })} slots={{}} />);
        await rendered.findByRole('alert');

        rendered.rerender(<PrimeChart element={sceneComponent('chart', 'chart', { data: { labels: ['January'], datasets: [{ data: [1] }] } })} slots={{}} />);
        await vi.waitFor(() => Chart.mock.calls.length.should.equal(2));
        (rendered.queryByRole('alert') === null).should.equal(true);
    });
});
