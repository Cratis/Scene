// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import type { ExternalComponent } from '@cratis/scene.model';
import { MenuItem } from '../MenuItem';

const item = (properties: Record<string, unknown>) =>
    ({ id: 'orders', name: 'orders', componentName: 'Cratis.Blueprint.Default:menuItem', properties, slots: {} }) as unknown as ExternalComponent;
const link = () => document.querySelector('.layout-menu-link')!;

// The slim and compact rails hide an entry's label (layout.css) and show only its icon; the link itself still says what it is (Scene#229).
describe('when a rail hides the label of a menu item', () => {
    afterEach(cleanup);

    describe('and the entry has a label', () => {
        beforeEach(() => render(<MenuItem element={item({ label: 'Orders', icon: 'pi pi-box', targetScreen: 'orders' })} slots={{}} />));

        it('should give the link the label as its tooltip', () => link().getAttribute('title')!.should.equal('Orders'));
        it('should keep the link findable by the label when the label is hidden', () => {
            document.querySelector<HTMLElement>('.layout-menu-label')!.style.display = 'none';
            (screen.getByRole('link', { name: 'Orders' }) === link()).should.equal(true);
        });
    });
});
