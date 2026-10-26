// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, screen } from '@testing-library/react';
import { renderFoundation } from '../for_foundation/given';

describe('when rendering an action icon', () => {
    afterEach(cleanup);

    it('should render the optional icon decoratively without changing the accessible name', () => {
        renderFoundation('actionButton', { label: 'New', icon: 'pi pi-plus', emphasis: 'primary' });
        const button = screen.getByRole('button', { name: 'New' });
        expect(button.querySelector('i')?.className).toBe('pi pi-plus');
        expect(button.querySelector('i')?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should keep actions without an icon unchanged', () => {
        renderFoundation('actionButton', { label: 'Cancel', emphasis: 'secondary' });
        expect(screen.getByRole('button', { name: 'Cancel' }).querySelector('i')).toBeNull();
    });
});
