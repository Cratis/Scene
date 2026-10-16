---
title: The Orders blueprint
description: Sales orders from placing to delivery - an orders list, an order page with its lines and shipments, a fulfilment board and a delivery calendar - the screens, the navigation, the sample data and how an application adopts them.
---

`@cratis/scene.blueprint.orders` is a **domain blueprint** for a team that takes and fulfils sales orders, built on the [foundation set](foundation-templates.md) the way
[the CRM blueprint](crm-blueprint.md) is: it brings no shell, component or theme of its own and adds what is particular to orders - four screen templates, one dialog
template, a screen set wired into navigation, and a sample-data pack. It is held to the same [definition of done](ship-your-own-blueprint.md#the-definition-of-done):
`verifyBlueprintPackage` is green, every template passes the per-template check, and every screen and dialog is audited in Chromium at desktop, tablet and phone widths in
the light and dark themes, colour contrast included.

## The screens

| Screen | Template | Foundation template | What it shows |
| --- | --- | --- | --- |
| `orders.list` | `OrdersList` | ListScreen | Every order with customer, placed and delivery dates, total and status; filtered by customer, status, channel and date; choosing an order opens it |
| `orders.record` | `OrderPage` | RecordPage | Status, total, items and days to delivery as key facts; the order's fields; its lines and its shipments; the activity beside it |
| `orders.fulfilment` | `OrdersFulfilmentBoard` | BoardScreen | A column for each step - new, picking, shipped, delivered - and a card for each order with customer, delivery date and channel |
| `orders.deliveries` | `OrdersDeliveryCalendar` | the foundation `calendarGrid` | The day each open order is due to arrive, on a month, a week or as an agenda; the status is told in words, and the orders due in the period are listed beside it |
| (dialog) | `OrdersQuickCreateOrder` | QuickCreateDialog | The few fields to start an order |

The category is `Business / Orders`. Templates carry their `scopes` (Part A 4.2): the list, the board and the calendar apply at module and feature level, the order page at
feature and sub-feature level, and the dialog at slice level.

## Navigation

The topbar names the module, `Orders`; the module's sidebar overrides the application's and lists **Orders**, **Fulfilment** and **Deliveries**. A screen is a feature of the
`orders` module: `orders.record` is the `record` feature. The screen set (`ordersScreenDefinitions`) is the one list the manifest's `blueprint.screenSet`, the `Screen` instances,
the application structure and the navigation are all derived from, and a specification holds them to it.

## Behaviors

- choosing an order opens its page, handing it the chosen row's id;
- **New order** opens the quick-create dialog, whose **Cancel** closes it;
- a card moves between steps by dragging or by its own **Move to** menu, and the move is announced; the *Picking* column says "Over the limit" in words when it holds more than four;
- the calendar keeps the day and the view in the address, so a link shares it as it is;
- the toolbar search narrows a list as it is typed and the search is part of the address.

## Sample data

`orders-en` (British English, pounds) holds twelve orders for six customers across the web, phone and partner channels, one order's lines, shipment and activity, the fulfilment
columns and cards, and the delivery events the calendar draws. Nothing in it is a real customer.

## Adopting it

Install the package, add `Cratis.Blueprint.Orders` to the application's blueprints and reference a template by name from Screenplay:

```
screen Orders
  template blueprint Cratis.Blueprint.Orders OrdersList version "^1.0"
```
