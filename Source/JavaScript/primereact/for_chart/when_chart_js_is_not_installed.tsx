// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { PrimeChart } from '../chart/PrimeChart';
import { sceneComponent } from '../storyElements';

vi.mock('chart.js/auto', () => {
    throw new Error("Failed to resolve import 'chart.js/auto'");
});

describe('when chart.js is not installed in the host', () => {
    const unhandled: unknown[] = [];
    const record = (reason: unknown) => unhandled.push(reason);

    beforeEach(() => process.on('unhandledRejection', record));
    afterEach(() => process.off('unhandledRejection', record));

    it('should say the chart cannot be drawn and why', async () => {
        const element = sceneComponent('chart', 'chart', { data: { datasets: [{ data: [1] }] } });
        const { findByRole } = render(<PrimeChart element={element} slots={{}} />);
        (await findByRole('alert')).textContent!.should.match(/^The chart could not be drawn: .+/);
    });

    it('should not leave an unhandled rejection behind', async () => {
        const element = sceneComponent('chart', 'chart', { data: { datasets: [{ data: [1] }] } });
        const { findByRole } = render(<PrimeChart element={element} slots={{}} />);
        await findByRole('alert');
        await new Promise(resolve => setTimeout(resolve, 20));
        unhandled.length.should.equal(0);
    });
});
