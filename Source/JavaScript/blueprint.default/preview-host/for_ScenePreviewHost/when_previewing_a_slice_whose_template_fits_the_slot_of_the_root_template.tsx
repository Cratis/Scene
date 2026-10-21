// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { Screen, ScreenTemplate } from '@cratis/scene.model';
import { ApplicationDocument } from '../ApplicationDocument';
import { element, ordersApplication, registry } from './given';
import { preview } from './when_previewing_a_module';

// The application's own root template and the template of a slice's screen both declare the slot `content`. On the application's shell the root template is the
// container; on the neutral surface of a slice preview there is no root template, so the template of the screen goes straight into the neutral layout - it is not
// "unplaced" because two containers could hold it (Cratis/StudioIssues#1068, Storefront ProductBrowse and ProductPage).
const shell: ScreenTemplate = { name: 'StorefrontShell', slots: [{ name: 'content' }], content: {} };
const grid: ScreenTemplate = { name: 'ProductGrid', slots: [{ name: 'content' }], fitsSlot: 'content', content: {} };

function applicationOf(): ApplicationDocument {
    const base = ordersApplication();
    const productBrowse: Screen = {
        name: 'ProductBrowse', layout: 'AppShell', screenTemplate: 'ProductGrid', owner: 'sales.orders.OrderList', forms: [], contributions: [],
        slotContent: { content: [element('product-grid', 'test:page', { title: 'Products' })] },
    };
    return {
        ...base,
        screenTemplates: [shell, grid],
        screens: [...base.screens, productBrowse],
        uiProfiles: [{ ...base.uiProfiles![0], root: { template: { source: 'Own' as never, id: 'StorefrontShell' }, options: {} } }],
    };
}

describe('when previewing a slice whose template fits the slot of the root template', () => {
    afterEach(cleanup);
    beforeEach(() => { render(preview({ document: applicationOf(), target: { slice: 'sales.orders.OrderList' }, registry })); });

    it('should draw what the slice owns', () => (document.querySelector('[data-page="product-grid"]') !== null).should.equal(true));
    it('should say nothing cannot be shown', () => (screen.queryByText('This preview cannot be shown') === null).should.equal(true));
    it('should draw no application chrome around it', () => [document.querySelector('.layout-topbar'), document.querySelector('nav')].should.deep.equal([null, null]));
});
