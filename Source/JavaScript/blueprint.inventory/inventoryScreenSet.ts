// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BlueprintScreen } from '@cratis/scene.model';

/** One ready-to-use screen: the qualified name that is also its place in the application (`inventory.items.record` is the `record` feature of `items` in the `inventory` module). */
export interface InventoryScreenDefinition extends BlueprintScreen {
    template: string;
    description: string;
}

/**
 * The screens the blueprint brings, in navigation order. This one list is what the manifest's screen set, the `Screen` instances, the application structure
 * and the navigation are all derived from, so they cannot disagree about which screens exist or where they sit.
 */
export const inventoryScreenDefinitions: InventoryScreenDefinition[] = [
    { name: 'inventory.dashboard', title: 'Dashboard', template: 'InventoryDashboard', order: 0, description: 'Low stock, stock value, top movers and recent movements.' },
    { name: 'inventory.items', title: 'Items', template: 'InventoryItemList', order: 1, description: 'Every item with its stock, low stock highlighted.' },
    { name: 'inventory.items.gallery', title: 'Item gallery', template: 'InventoryItemGallery', parent: 'inventory.items', order: 0, description: 'Every item as a card with its picture.' },
    { name: 'inventory.items.record', title: 'Item', template: 'InventoryItemPage', parent: 'inventory.items', description: 'One item with its stock by location, movement history and supplier.' },
    { name: 'inventory.locations', title: 'Locations', template: 'InventoryLocations', order: 2, description: 'The location tree beside what is stored in the chosen location.' },
    { name: 'inventory.movements', title: 'Movements', template: 'InventoryMovementList', order: 3, description: 'Every check in, check out, transfer and adjustment.' },
    { name: 'inventory.movements.check', title: 'Check in or out', template: 'InventoryCheckInOut', parent: 'inventory.movements', description: 'Scan or search an item and check it in or out, from a phone.' },
    { name: 'inventory.suppliers', title: 'Suppliers', template: 'InventorySupplierList', order: 4, description: 'The suppliers items are bought from.' },
];
