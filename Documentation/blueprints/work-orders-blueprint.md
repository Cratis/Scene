---
title: The Work orders blueprint
description: Work orders for a maintenance or field-service team - a work order list, a work order page with its tasks, parts and time, a board by step and a schedule of visits.
---

`@cratis/scene.blueprint.work-orders` is a **domain blueprint** built on the [foundation set](foundation-templates.md) the way [the Orders blueprint](orders-blueprint.md) is: it brings no shell, component or theme of its own and adds what is particular to work orders - four screen templates, one dialog template, a screen set wired into navigation, and a sample-data pack. It is held to the same [definition of done](ship-your-own-blueprint.md#the-definition-of-done): `verifyBlueprintPackage` is green, every template passes the per-template check, and every screen and dialog is audited in Chromium at desktop, tablet and phone widths in the light and dark themes, colour contrast included.

## The screens

| Screen | Template | Foundation template | What it shows |
| --- | --- | --- | --- |
| `workorders.list` | `WorkOrdersList` | ListScreen | Every work order with its site, priority, assignee and status. |
| `workorders.record` | `WorkOrderPage` | RecordPage | One work order: key facts, its tasks, the parts used, the time logged and its activity. |
| `workorders.board` | `WorkOrdersBoard` | BoardScreen | Work orders in a column for each step: new, scheduled, in progress and done. |
| `workorders.schedule` | `WorkOrdersSchedule` | the foundation `calendarGrid` | The day each work order is planned, on a calendar. |
| (dialog) | `WorkOrdersQuickCreateWorkOrder` | QuickCreateDialog | The few fields to start a work order. |

The category is `Business / Work orders`. Templates carry their `scopes` (Part A 4.2): the lists, boards, calendars, timelines, dashboards, inboxes and profiles apply at module and feature level, the record pages and wizards at feature and sub-feature level, and the dialogs at slice level.

## Navigation

The topbar names the module, `workorders`; the module's sidebar overrides the application's and lists **Work orders**, **Board** and **Schedule**. A screen is a feature of the `workorders` module: `workorders.list` is the `list` feature. The screen set (`workOrdersScreenDefinitions`) is the one list the manifest's `blueprint.screenSet`, the `Screen` instances, the application structure and the navigation are all derived from, and a specification holds them to it.

## Behaviors

- choosing a row of **Work orders** opens its page, handing it the chosen row's id;
- **New work order** opens the `WorkOrdersQuickCreateWorkOrder` dialog, whose button closes it;
- a card on **Board** moves between steps by dragging or by its own **Move to** menu, and the move is announced; a column that holds more than its limit says "Over the limit" in words;
- the calendar on **Schedule** keeps the day and the view in the address, so a link shares it as it is;
- the toolbar search narrows a list as it is typed and the search is part of the address.

## Sample data

`work-orders-en` (British English, pounds) holds work order data: twelve work orders across four sites from new to done, one work order's tasks, parts and time, the board columns and the scheduled visits. Nothing in it is a real person or company.

## Adopting it

Install the package, add `Cratis.Blueprint.WorkOrders` to the application's blueprints and reference a template by name from Screenplay:

```
screen WorkOrders
  template blueprint Cratis.Blueprint.WorkOrders WorkOrdersList version "^1.0"
```

A complete application built from it is [`Samples/WorkOrders`](https://github.com/Cratis/Screenplay/tree/main/Samples/WorkOrders) in Screenplay.
