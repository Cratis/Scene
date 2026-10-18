---
title: The Vendors blueprint
description: Vendors for a purchasing team - a vendor list, a vendor page with its contacts, orders and certificates, an onboarding board and a performance dashboard.
---

`@cratis/scene.blueprint.vendors` is a **domain blueprint** built on the [foundation set](foundation-templates.md) the way [the Orders blueprint](orders-blueprint.md) is: it brings no shell, component or theme of its own and adds what is particular to vendors - four screen templates, one dialog template, a screen set wired into navigation, and a sample-data pack. It is held to the same [definition of done](ship-your-own-blueprint.md#the-definition-of-done): `verifyBlueprintPackage` is green, every template passes the per-template check, and every screen and dialog is audited in Chromium at desktop, tablet and phone widths in the light and dark themes, colour contrast included.

## The screens

| Screen | Template | Foundation template | What it shows |
| --- | --- | --- | --- |
| `vendors.list` | `VendorsList` | ListScreen | Every vendor with what you spend with them and how they perform. |
| `vendors.record` | `VendorPage` | RecordPage | One vendor: key facts, contacts, purchase orders, certificates and activity. |
| `vendors.onboarding` | `VendorsOnboardingBoard` | BoardScreen | Vendors in a column for each onboarding step: prospect, in review, approved and active. |
| `vendors.performance` | `VendorsPerformance` | DashboardScreen | How vendors perform: spend, on-time delivery and the vendors to watch. |
| (dialog) | `VendorsQuickCreateVendor` | QuickCreateDialog | The few fields to start a vendor. |

The category is `Business / Vendors`. Templates carry their `scopes` (Part A 4.2): the lists, boards, calendars, timelines, dashboards, inboxes and profiles apply at module and feature level, the record pages and wizards at feature and sub-feature level, and the dialogs at slice level.

## Navigation

The topbar names the module, `vendors`; the module's sidebar overrides the application's and lists **Vendors**, **Onboarding** and **Performance**. A screen is a feature of the `vendors` module: `vendors.list` is the `list` feature. The screen set (`vendorsScreenDefinitions`) is the one list the manifest's `blueprint.screenSet`, the `Screen` instances, the application structure and the navigation are all derived from, and a specification holds them to it.

## Behaviors

- choosing a row of **Vendors** opens its page, handing it the chosen row's id;
- **New vendor** opens the `VendorsQuickCreateVendor` dialog, whose button closes it;
- a card on **Onboarding** moves between steps by dragging or by its own **Move to** menu, and the move is announced; a column that holds more than its limit says "Over the limit" in words;
- the toolbar search narrows a list as it is typed and the search is part of the address.

## Sample data

`vendors-en` (British English, pounds) holds vendor data: twelve vendors from prospect to active, one vendor's contacts, purchase orders and certificates, the onboarding steps and performance figures. Nothing in it is a real person or company.

## Adopting it

Install the package, add `Cratis.Blueprint.Vendors` to the application's blueprints and reference a template by name from Screenplay:

```
screen Vendors
  template blueprint Cratis.Blueprint.Vendors VendorsList version "^1.0"
```

A complete application built from it is [`Samples/Vendors`](https://github.com/Cratis/Screenplay/tree/main/Samples/Vendors) in Screenplay.
