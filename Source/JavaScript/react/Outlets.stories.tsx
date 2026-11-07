// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { ActionSlice, InputSourceKind, OutletLevel, OutletLevelKind, PlacementSlot } from '@cratis/scene.engine';
import { ExternalComponent, FilterControl, Opens, OutletBuiltInAction, OutletItemKind, OutletKind, OutletSubject, SceneElement, ScreenFit, SlotRole, ToolbarEmphasis } from '@cratis/scene.model';
import { coreComponents } from './core';
import { SceneNavigationHost } from './navigation/SceneNavigationHost';
import { SceneOutletsProvider } from './outlets/SceneOutletsContext';
import { SceneRouterProvider, SceneRouteState, useSceneRouter } from './routing';
import { routedSlotPath, sceneRouteQueryString } from './routing/routedSlotPath';

const element = (id: string, componentName: string, properties: Record<string, unknown> = {}, slots: Record<string, SceneElement[]> = {}) =>
    ({ id, componentName, properties, slots }) as unknown as ExternalComponent;

const kettle = { sku: 'NK-101', name: 'Nordic Kettle', price: 649 };

const slices: ActionSlice[] = [
    { id: 'Catalog.Products.AddProduct', command: 'AddProduct', screen: 'AddProduct', fits: [ScreenFit.Dialog], inputs: [{ name: 'name' }, { name: 'price' }] },
    { id: 'Catalog.Products.SetProductPrice', command: 'SetProductPrice', screen: 'SetProductPrice', fits: [ScreenFit.Drawer, ScreenFit.Pane, ScreenFit.Dialog], inputs: [{ name: 'sku', source: InputSourceKind.DataContext }, { name: 'price' }] },
    { id: 'Catalog.Products.WithdrawProduct', command: 'WithdrawProduct', inputs: [{ name: 'sku', source: InputSourceKind.DataContext }] },
    { id: 'Catalog.Products.ProductDetails', command: 'ShowProduct', screen: 'ProductDetails', fits: [ScreenFit.Pane], inputs: [{ name: 'sku', source: InputSourceKind.DataContext }] },
];

const slots: PlacementSlot[] = [
    { name: 'content', role: SlotRole.Page, routed: true },
    { name: 'detail', role: SlotRole.Pane, routed: true, routedBy: ['sku'] },
    { name: 'activity', role: SlotRole.Panel },
];

const chain: OutletLevel[] = [
    {
        kind: OutletLevelKind.Template, name: 'ListPage', outlets: [
            {
                name: 'toolbar', kind: OutletKind.Actions, defaults: [
                    { kind: OutletItemKind.Button, id: 'refresh', title: 'Refresh', builtIn: OutletBuiltInAction.Refresh },
                    { kind: OutletItemKind.Button, id: 'export', title: 'Export' },
                ],
            },
            {
                name: 'rowActions', kind: OutletKind.Actions, subject: OutletSubject.Item, defaults: [
                    { kind: OutletItemKind.Button, id: 'price', title: 'Set price', slice: 'Catalog.Products.SetProductPrice' },
                    { kind: OutletItemKind.Button, id: 'withdraw', title: 'Withdraw', slice: 'Catalog.Products.WithdrawProduct', confirm: 'Withdraw the product?' },
                    { kind: OutletItemKind.Button, id: 'details', title: 'Details', slice: 'Catalog.Products.ProductDetails', opens: Opens.Slot, opensIn: 'detail' },
                    { kind: OutletItemKind.Separator, id: 'gap' },
                    { kind: OutletItemKind.Group, id: 'more', title: 'More', items: [{ kind: OutletItemKind.MenuEntry, id: 'archive', title: 'Archive', navigateTo: { screen: 'Archive' } }] },
                ],
            },
            { name: 'filters', kind: OutletKind.Filters, defaults: [{ kind: OutletItemKind.Filter, id: 'search', title: 'Search', control: FilterControl.Search, sets: { query: 'AllProducts', parameter: 'q' } }] },
            { name: 'stats', kind: OutletKind.Stats, defaults: [{ kind: OutletItemKind.Stat, id: 'total', title: 'Products', valueFrom: { query: 'ProductStats', field: 'total' } }] },
            { name: 'detailTabs', kind: OutletKind.Tabs, slot: 'detail', defaults: [{ kind: OutletItemKind.Tab, id: 'overview', title: 'Overview', shows: 'ProductOverview' }] },
            { name: 'sidebar', kind: OutletKind.Navigation, defaults: [] },
        ],
    },
    {
        kind: OutletLevelKind.Feature, name: 'Products',
        refinements: [
            { outlet: 'toolbar', items: [{ kind: OutletItemKind.Button, id: 'add', title: 'Add product', slice: 'Catalog.Products.AddProduct', emphasis: ToolbarEmphasis.Primary }] },
            {
                outlet: 'filters', items: [
                    { kind: OutletItemKind.Filter, id: 'status', title: 'Status', control: FilterControl.Choice, sets: { query: 'AllProducts', parameter: 'status' } },
                    { kind: OutletItemKind.Filter, id: 'price', title: 'Price', control: FilterControl.Range, sets: { query: 'AllProducts', parameter: 'price' } },
                    { kind: OutletItemKind.Filter, id: 'since', title: 'Changed since', control: FilterControl.Date, sets: { query: 'AllProducts', parameter: 'since' } },
                ],
            },
            { outlet: 'stats', items: [{ kind: OutletItemKind.Stat, id: 'drafts', title: 'Drafts', valueFrom: { query: 'ProductStats', field: 'drafts' }, trend: { query: 'ProductStats', field: 'draftsChange' } }] },
            {
                outlet: 'sidebar', items: [
                    { kind: OutletItemKind.Navigation, id: 'products', title: 'Products', icon: 'box', target: { screen: 'Products' } },
                    { kind: OutletItemKind.Navigation, id: 'catalog', title: 'Catalog', children: [{ kind: OutletItemKind.Navigation, id: 'archived', title: 'Archived', target: { screen: 'Archive' } }] },
                ],
            },
        ],
    },
];

const contributors: OutletLevel[] = [{
    kind: OutletLevelKind.Feature, name: 'Pricing',
    contributions: [{ outlet: 'detailTabs', items: [{ kind: OutletItemKind.Tab, id: 'pricing', title: 'Pricing', shows: 'ProductPricing' }] }],
}];

const screens: Record<string, SceneElement> = {
    ProductOverview: element('overview', 'core:text', { text: 'Nordic Kettle · NK-101 · NOK 649' }),
    ProductPricing: element('pricing', 'core:text', { text: 'Price history of the Nordic Kettle' }),
    ProductDetails: element('details', 'core:outletItems', { name: 'detailTabs' }),
    Comments: element('comments', 'core:text', { text: 'Two comments on this product' }),
};

function RouteState() {
    const router = useSceneRouter();
    const detail = router.state.slots.detail;
    return <pre data-scene-story-route>
        {`detail: ${detail ? `/${routedSlotPath(detail, ['sku'])}` : '(empty)'}\ntabs: ${JSON.stringify(router.state.tabs)}\nquery: ${sceneRouteQueryString(router.state.query) || '(none)'}`}
    </pre>;
}

interface PageProps {
    content: SceneElement;
    initialState?: SceneRouteState;
}

/** The page inside a navigation host that shares the story's router, so dialogs and drawers open and the route state shows. */
function Hosted({ content }: { content: SceneElement }) {
    const router = useSceneRouter();
    return <SceneNavigationHost screens={{ ...screens, Page: content }} initialScreen='Page' registry={coreComponents} router={router}
        bindingScope={{ queryResults: { ProductStats: { total: 128, drafts: 9, draftsChange: 2 } } }} />;
}

function Page({ content, initialState }: PageProps) {
    return <SceneRouterProvider initialState={initialState}>
        <SceneOutletsProvider value={{
            chain, contributors, slices, slots,
            filterChoices: { status: [{ value: 'onSale', label: 'On sale' }, { value: 'draft', label: 'Draft' }] },
        }}>
            <Hosted content={content} />
        </SceneOutletsProvider>
        <RouteState />
    </SceneRouterProvider>;
}

/**
 * The outlets a template offers, drawn by `core:outletItems` and resolved through the page's chain: a template declares them
 * with their defaults, the Products feature extends them, and the Pricing feature contributes a tab. The route state below each
 * story is what a routed host (Stage) puts in the URL.
 */
const meta = {
    title: 'Scene/Outlets',
    component: Page,
    parameters: { layout: 'padded' },
} satisfies Meta<typeof Page>;

export default meta;

type Story = StoryObj<typeof meta>;

/** An outlet of actions as a toolbar: the template's Refresh and Export, then the feature's Add product, which opens in a dialog. */
export const Actions: Story = { args: { content: element('toolbar', 'core:outletItems', { name: 'toolbar' }) } };

/** Row actions for the selected item: Set price opens in a drawer, Withdraw runs directly after asking, Details opens in the routed detail pane. */
export const RowActions: Story = { args: { content: element('rows', 'core:outletItems', { name: 'rowActions', item: kettle }) } };

/** Row actions with nothing selected: each action for an item is disabled, with the reason as its tooltip. */
export const RowActionsWithoutSelection: Story = { args: { content: element('rows', 'core:outletItems', { name: 'rowActions' }) } };

/** An outlet of filters: a search box, choice chips, a range and a date, each writing its query parameter. */
export const Filters: Story = { args: { content: element('filters', 'core:outletItems', { name: 'filters' }) } };

/** An outlet of tabs owning the detail slot; Pricing is contributed by another feature. */
export const Tabs: Story = { args: { content: element('tabs', 'core:outletItems', { name: 'detailTabs' }) } };

/** An outlet of stats: each value from a field of a single-result query, with a trend. */
export const Stats: Story = { args: { content: element('stats', 'core:outletItems', { name: 'stats' }) } };

/** An outlet of navigation: titles, icons, targets and sub-items. */
export const Navigation: Story = { args: { content: element('sidebar', 'core:outletItems', { name: 'sidebar' }) } };

/** A routed pane: the router says it shows the product details for NK-101, so the URL carries `/NK-101`. */
export const RoutedSlot: Story = {
    args: {
        content: element('detail', 'core:slot', { name: 'detail', role: SlotRole.Pane, routed: true, routedBy: ['sku'], optional: true }),
        initialState: { slots: { detail: { screen: 'ProductDetails', parameters: { sku: 'NK-101' } } }, tabs: {}, query: {} },
    },
};

/** A panel docked beside the content: a landmark that stays open while you work and is not routed. */
export const DockedPanel: Story = {
    args: {
        content: element('page', 'core:section', {}, {
            content: [
                element('main', 'core:text', { text: 'The products list' }),
                element('activity', 'core:slot', { name: 'activity', role: SlotRole.Panel }),
            ],
        }),
    },
};
