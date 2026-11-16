// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FilterControl, OutletBuiltInAction, OutletItemKind, OutletKind, OutletMode, OutletSubject, QueryResultShape, SlotRole, type QueryCandidate, type SceneDocument, type ScreenTemplate } from '@cratis/scene.model';
import { OutletLevelKind } from '@cratis/scene.engine';
import { defaultOutletStrings } from '../OutletStrings';
import { createOutletDesign, type OutletDesign } from '../createOutletDesign';
import type { OutletBindingContext } from '../outletBindings';
import type { OutletEditingLevel, OutletDocument } from '../../../Outlets/outletDocument';
import { screenOutletChain } from '../../../Outlets/screenOutletChain';
import type { DesignModePlan, DesignModeRejection } from '../../designModeTypes';

// The catalog of the prototype (6b-6d): a ListPage that offers a toolbar with Refresh and Export, a search filter, stats, the tabs of its detail pane and a
// section navigation; the Products screen sits in the Catalog module's Products feature.
export const listPage: ScreenTemplate = {
    name: 'ListPage',
    slots: [
        { name: 'content', role: SlotRole.Page, routed: true, primary: true },
        { name: 'detail', role: SlotRole.Pane, routed: true, routedBy: ['sku'], optional: true },
    ],
    outlets: [
        { name: 'toolbar', kind: OutletKind.Actions, defaults: [
            { kind: OutletItemKind.Button, id: 'refresh', title: 'Refresh', builtIn: OutletBuiltInAction.Refresh },
            { kind: OutletItemKind.Button, id: 'export', title: 'Export' },
        ] },
        { name: 'rowActions', kind: OutletKind.Actions, subject: OutletSubject.Item, defaults: [] },
        { name: 'filters', kind: OutletKind.Filters, defaults: [{ kind: OutletItemKind.Filter, id: 'search', title: 'Search', control: FilterControl.Search }] },
        { name: 'stats', kind: OutletKind.Stats, defaults: [{ kind: OutletItemKind.Stat, id: 'items', title: 'Items' }] },
        { name: 'detailTabs', kind: OutletKind.Tabs, slot: 'detail', defaults: [{ kind: OutletItemKind.Tab, id: 'overview', title: 'Overview', shows: 'ProductOverview' }] },
        { name: 'sections', kind: OutletKind.Navigation, defaults: [{ kind: OutletItemKind.Navigation, id: 'all', title: 'All products' }] },
    ],
};

export const screen = 'Screen';
export const products: OutletEditingLevel = { kind: OutletLevelKind.Feature, name: 'Products' };
export const catalog: OutletEditingLevel = { kind: OutletLevelKind.Module, name: 'Catalog' };
export const theScreen: OutletEditingLevel = { kind: OutletLevelKind.Screen, name: screen };

// The Catalog module adds Add product to the toolbar; the Pricing feature contributes Set price to it.
export function catalogDocument(more: Partial<OutletDocument> = {}): SceneDocument {
    return {
        layouts: [{ name: 'StudioScreen', slots: [{ name: 'content' }] }],
        screenTemplates: [listPage],
        dialogTemplates: [],
        screens: [{ name: screen, layout: 'StudioScreen', screenTemplate: 'ListPage', slotContent: {}, path: ['Catalog', 'Products'] }],
        exposures: [],
        instanceContributions: [],
        navigation: {
            application: { outlets: [] },
            modules: [{ module: 'Catalog', refinements: [{ outlet: 'toolbar', mode: OutletMode.Extends, items: [{ kind: OutletItemKind.Button, id: 'addProduct', title: 'Add product', slice: 'AddProduct' }] }] }],
        },
        outletLevels: [{ kind: OutletLevelKind.Feature, name: 'Pricing', contributions: [{ outlet: 'toolbar', items: [{ kind: OutletItemKind.Button, id: 'setPrice', title: 'Set price', slice: 'SetProductPrice' }] }] }],
        ...more,
    } as SceneDocument;
}

export const queries: QueryCandidate[] = [
    { id: 'all-products', name: 'AllProducts', origin: [], parameters: [{ name: 'status', type: 'string', required: false }, { name: 'search', type: 'string', required: false }], resultShape: QueryResultShape.Collection, resultFields: [{ name: 'name', type: 'string' }] },
    { id: 'product-stats', name: 'ProductStats', origin: [], parameters: [], resultShape: QueryResultShape.Single, resultFields: [{ name: 'drafts', type: 'number' }, { name: 'onSale', type: 'number' }] },
];

export const binding: OutletBindingContext = {
    queries,
    screens: [{ id: 'ProductPricing', label: 'Product pricing' }, { id: 'ProductOverview', label: 'Product overview' }],
    actionProperties: [],
    strings: defaultOutletStrings.bindings,
};

let counter = 0;
export const newId = () => `new-${++counter}`;

export function designOf(document: SceneDocument, outlet: string, level: OutletEditingLevel = products): OutletDesign {
    const outlets = screenOutletChain({ document, screen });
    const design = createOutletDesign({ document, outlets, outlet, level, newId, binding, strings: defaultOutletStrings });
    if (!design) throw new Error(`no outlet ${outlet}`);
    return design;
}

// Carries out what an action came to, the way the editor does: one change of the document.
export function carryOut(document: SceneDocument, outcome: DesignModePlan | DesignModeRejection): SceneDocument {
    if ('rejected' in outcome) throw new Error(`rejected: ${outcome.rejected}`);
    if (!outcome.documentChange) throw new Error('no change');
    return outcome.documentChange(document);
}

export const labelsOf = (design: OutletDesign): string[] => design.items.map(item => item.parentId ? `  ${item.label}` : item.label);
