---
title: The Customer portal blueprint
description: A self-service portal for customers - an account home, their orders and invoices, a support inbox and their own profile.
---

`@cratis/scene.blueprint.customer-portal` is a **domain blueprint** built on the [foundation set](foundation-templates.md) the way [the Orders blueprint](orders-blueprint.md) is: it brings no shell, component or theme of its own and adds what is particular to customer portal - six screen templates, two dialog templates, a screen set wired into navigation, and a sample-data pack. It is held to the same [definition of done](ship-your-own-blueprint.md#the-definition-of-done): `verifyBlueprintPackage` is green, every template passes the per-template check, and every screen and dialog is audited in Chromium at desktop, tablet and phone widths in the light and dark themes, colour contrast included.

## The screens

| Screen | Template | Foundation template | What it shows |
| --- | --- | --- | --- |
| `portal.home` | `PortalHome` | DashboardScreen | Your account at a glance: open orders, what you owe and what happened lately. |
| `portal.orders` | `PortalOrdersList` | ListScreen | Your orders and where each one is. |
| `portal.order` | `PortalOrderPage` | RecordPage | One order: key facts, its lines, tracking and what happened to it. |
| `portal.invoices` | `PortalInvoicesList` | ListScreen | Your invoices and which ones are still to pay. |
| `portal.support` | `PortalSupport` | InboxScreen | Your conversations with us: questions, reminders and quotes. |
| `portal.profile` | `PortalProfile` | ProfileScreen | Your details, delivery address and preferences. |
| (dialog) | `PortalQuickCreateReorder` | QuickCreateDialog | The few fields to start a order. |
| (dialog) | `PortalNewSupportRequest` | QuickCreateDialog | The few fields to ask for help. |

The category is `Business / Customer portal`. Templates carry their `scopes` (Part A 4.2): the lists, boards, calendars, timelines, dashboards, inboxes and profiles apply at module and feature level, the record pages and wizards at feature and sub-feature level, and the dialogs at slice level.

## Navigation

The topbar names the module, `portal`; the module's sidebar overrides the application's and lists **Home**, **Orders**, **Invoices**, **Support** and **Profile**. A screen is a feature of the `portal` module: `portal.home` is the `home` feature. The screen set (`customerPortalScreenDefinitions`) is the one list the manifest's `blueprint.screenSet`, the `Screen` instances, the application structure and the navigation are all derived from, and a specification holds them to it.

## Behaviors

- choosing a row of **Orders** opens its page, handing it the chosen row's id;
- **Reorder** opens the `PortalQuickCreateReorder` dialog, whose button closes it;
- **Ask about an invoice** opens the `PortalNewSupportRequest` dialog, whose button closes it;
- the queue on **Support** is grouped by day, tells unread in words and moves by keyboard; the open message is kept in the address;
- the toolbar search narrows a list as it is typed and the search is part of the address.

## Sample data

`customer-portal-en` (British English, pounds) holds portal data for one customer: their orders and invoices, one order's lines and tracking, support conversations and the contact's profile. Nothing in it is a real person or company.

## Adopting it

Install the package, add `Cratis.Blueprint.CustomerPortal` to the application's blueprints and reference a template by name from Screenplay:

```
screen Home
  template blueprint Cratis.Blueprint.CustomerPortal PortalHome version "^1.0"
```

A complete application built from it is [`Samples/CustomerPortal`](https://github.com/Cratis/Screenplay/tree/main/Samples/CustomerPortal) in Screenplay.
