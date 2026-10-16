---
title: The Inventory and Assets blueprint
description: Items, locations, movements and suppliers for a warehouse - the screens, the navigation, the sample data and how an application adopts them.
---

`@cratis/scene.blueprint.inventory` is a **domain blueprint** for a warehouse or a store room, built on the
[foundation set](foundation-templates.md) the way [the CRM blueprint](crm-blueprint.md) is: it brings no shell, component or theme of its own and
adds what is particular to stock - eight screen templates, three quick-create dialogs, a screen set wired into navigation, and a sample-data pack. It follows
Part B 3.4 of the screen blueprints specification and is held to the same [definition of done](ship-your-own-blueprint.md#the-definition-of-done):
`verifyBlueprintPackage` is green, every template passes the per-template check, and every screen and dialog is audited in Chromium at desktop,
tablet and phone widths in the light and dark themes, colour contrast included.

## The screens

| Screen | Template | Foundation template | What it shows |
| --- | --- | --- | --- |
| `inventory.dashboard` | `InventoryDashboard` | Dashboard (Operational) | Low stock count, stock value and movements this week; top movers (bar); recent movements; the items to reorder |
| `inventory.items` | `InventoryItemList` | ListScreen | Sku, name, category, location, quantity and status; low-stock items tinted and marked "Low stock"; filters category, location, status; choosing a row opens the item |
| `inventory.items.gallery` | `InventoryItemGallery` | ListScreen (cards) | The same items as cards, each with its picture |
| `inventory.items.record` | `InventoryItemPage` | RecordPage | Key facts, the item's fields with its supplier, stock by location and movement history as related lists, cycle counts beside it; **Adjust stock** and **Check out** |
| `inventory.locations` | `InventoryLocations` | MasterDetail | The tree of locations beside what is stored in the chosen location and beneath it |
| `inventory.movements` | `InventoryMovementList` | ListScreen (read-only) | Date, item, type, quantity, location and who; nothing is selectable or editable |
| `inventory.movements.check` | `InventoryCheckInOut` | FormScreen (mobile-first) | One column: the item (scanned or searched), direction, quantity, who has it and when it is due back |
| `inventory.suppliers` | `InventorySupplierList` | ListScreen | Name, contact, email, items supplied and status |
| (dialogs) | `InventoryAdjustStock`, `InventoryQuickCreateItem`, `InventoryQuickCreateSupplier` | QuickCreateDialog | **Adjust stock** (item, quantity change, reason), and the few fields to start an item or a supplier |

The categories are all `Business / Inventory`. Templates carry their `scopes` (Part A 4.2): the dashboard, lists and locations apply at module and
feature level, the item page and the check in/out form at feature and sub-feature level, and the dialogs at slice level, so `applicableTemplates` offers each
only where it fits and hides the blueprint where nothing of it applies.

## Navigation

The topbar names the module, `Inventory`; the module's sidebar overrides the application's and lists **Dashboard, Items** (with **Table** and **Gallery**
beneath it), **Locations, Movements** and **Suppliers**. A screen is a feature of the `inventory` module: `inventory.items.record` is the `record` feature of
`items`. The screen set (`inventoryScreenDefinitions`) is the one list the manifest's `blueprint.screenSet`, the `Screen` instances, the application
structure and the navigation are all derived from, and a specification holds them to it.

## Behaviors

- **New item** and **New supplier** open their quick-create dialogs, whose **Cancel** closes them; **Adjust stock** opens its dialog from an item or from the locations screen;
- choosing an item opens its page, handing it the chosen row's id; **Check out** and **Check in or out** go to the check in/out form;
- low stock is shown three ways - the row's tint, the status chip's icon and its words - so colour is never the only cue;
- the toolbar search narrows the list as it is typed, and the search is part of the address;
- choosing a location narrows the contents to it and everything beneath it. The tree keeps the choice in the address under the contents list's own
  search parameter, and a location's id is its path (`Main warehouse / Aisle A`), so "beneath" is "starts with" and a link restores the choice.

The check in/out form is **mobile-first**: a single column of fields, the item first. A barcode scanner types into a field like a keyboard, so the item field
is a text field that takes a scanned SKU or a typed name; nothing about it needs a camera.

## Data, not values

No template carries a row: every property that shows data is a binding to a query (`Items`, `ItemColumns`, `ItemFilterFields`, `LocationNodes`, `LocationContents` ...)
and the pack answers it. One pack ships, `inventory-warehouse` (`en-GB`, GBP), owned by `blueprint:inventory`: sixteen items in four categories, fourteen movements,
five suppliers and a three-level tree of locations. Its one-row `InventorySettings` shape gives every figure and date its locale and currency.

## Using it

```ts
import { inventoryApplication, inventoryComposition, inventoryNavigation, inventoryStructure } from '@cratis/scene.blueprint.inventory';

const application = inventoryApplication();   // layouts, templates, dialogs, screens and a profile with the pack active
// <ScenePreviewHost document={application} structure={inventoryStructure} navigation={inventoryNavigation} target={{ module: 'inventory' }} ... />
```
