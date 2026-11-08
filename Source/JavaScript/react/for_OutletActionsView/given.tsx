// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ActionSlice, EnablementPersona, InputSourceKind, OutletLevel, OutletLevelKind, PlacementSlot } from '@cratis/scene.engine';
import { ExternalComponent, Opens, OutletButtonDisplay, OutletItemKind, OutletKind, OutletSubject, ScreenFit, SlotRole } from '@cratis/scene.model';
import { coreComponents } from '../core';
import { SceneNavigationHost } from '../navigation/SceneNavigationHost';
import { SceneOutletsProvider } from '../outlets/SceneOutletsContext';
import { emptySceneRouteState, SceneRouter, SlotRoute } from '../routing/SceneRouter';
import { SliceInvoker, SliceInvokerProvider } from '../slices';

export const slices: ActionSlice[] = [
    {
        id: 'Catalog.Products.SetProductPrice', command: 'SetProductPrice', screen: 'SetProductPrice', fits: [ScreenFit.Drawer, ScreenFit.Pane, ScreenFit.Dialog],
        inputs: [{ name: 'sku', source: InputSourceKind.DataContext }, { name: 'price' }],
    },
    { id: 'Catalog.Products.WithdrawProduct', command: 'WithdrawProduct', inputs: [{ name: 'sku', source: InputSourceKind.DataContext }] },
    { id: 'Catalog.Products.ProductDetails', command: 'ShowProduct', screen: 'ProductDetails', fits: [ScreenFit.Pane], inputs: [{ name: 'sku', source: InputSourceKind.DataContext }] },
    { id: 'Catalog.Products.DeleteProduct', command: 'DeleteProduct', inputs: [{ name: 'sku', source: InputSourceKind.DataContext }], authorize: 'catalog.admin' },
];

export const chain: OutletLevel[] = [{
    kind: OutletLevelKind.Template,
    name: 'ListPage',
    outlets: [{
        name: 'rowActions',
        kind: OutletKind.Actions,
        subject: OutletSubject.Item,
        defaults: [
            { kind: OutletItemKind.Button, id: 'price', title: 'Set price', slice: 'Catalog.Products.SetProductPrice' },
            { kind: OutletItemKind.Button, id: 'withdraw', title: 'Withdraw', slice: 'Catalog.Products.WithdrawProduct', confirm: 'Withdraw the product?' },
            { kind: OutletItemKind.Separator, id: 'gap' },
            { kind: OutletItemKind.Button, id: 'details', title: 'Details', slice: 'Catalog.Products.ProductDetails', opens: Opens.Slot, opensIn: 'detail' },
            { kind: OutletItemKind.Group, id: 'more', title: 'More', items: [{ kind: OutletItemKind.MenuEntry, id: 'delete', title: 'Delete', slice: 'Catalog.Products.DeleteProduct' }] },
            { kind: OutletItemKind.MenuEntry, id: 'archive', title: 'Archive', navigateTo: { screen: 'Archive' } },
            { kind: OutletItemKind.Button, id: 'create', title: 'New product', icon: 'add', display: OutletButtonDisplay.Icon, navigateTo: { screen: 'NewProduct' } },
            { kind: OutletItemKind.Button, id: 'print', title: 'Print', icon: 'print', display: OutletButtonDisplay.Title, navigateTo: { screen: 'PrintProducts' } },
            { kind: OutletItemKind.Button, id: 'label', title: 'Label', display: OutletButtonDisplay.Icon, navigateTo: { screen: 'LabelProducts' } },
        ],
    }],
}];

export const slots: PlacementSlot[] = [
    { name: 'content', role: SlotRole.Page, routed: true },
    { name: 'detail', role: SlotRole.Pane, routed: true, routedBy: ['sku'] },
];

export const clerk: EnablementPersona = { name: 'Clerk', policies: [] };

export interface Recorded {
    opened: [string, SlotRoute][];
    invoked: { slice: string; payload: Record<string, unknown>; command?: string }[];
}

export function recordingRouter(recorded: Recorded): SceneRouter {
    return {
        state: emptySceneRouteState,
        openInSlot: (slot, route) => recorded.opened.push([slot, route]),
        closeSlot: () => undefined,
        selectTab: () => undefined,
        setQueryParameter: () => undefined,
    };
}

export function recordingInvoker(recorded: Recorded): SliceInvoker {
    return {
        invoke: async (slice, payload, command) => {
            recorded.invoked.push({ slice, payload, command });
            return { succeeded: true };
        },
    };
}

const outletElement = (item: unknown) => ({
    id: 'row-actions', componentName: 'core:outletItems', properties: { name: 'rowActions', item }, slots: {},
}) as unknown as ExternalComponent;

export interface ProductsPageProps {
    recorded: Recorded;
    item?: unknown;
    persona?: EnablementPersona;
}

/** The products page: an outlet of row actions resolved through the template, inside a navigation host. */
export function ProductsPage({ recorded, item, persona }: ProductsPageProps) {
    return <SliceInvokerProvider invoker={recordingInvoker(recorded)}>
        <SceneOutletsProvider value={{ chain, slices, slots, persona }}>
            <SceneNavigationHost screens={{ Products: outletElement(item) }} initialScreen='Products' registry={coreComponents} router={recordingRouter(recorded)} />
        </SceneOutletsProvider>
    </SliceInvokerProvider>;
}
