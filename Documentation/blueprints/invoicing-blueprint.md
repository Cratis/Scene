---
title: The Invoicing blueprint
description: Invoices for a finance team - a receivables overview, an invoice list, an invoice page with its lines and payments, the payments received and a due-date calendar.
---

`@cratis/scene.blueprint.invoicing` is a **domain blueprint** built on the [foundation set](foundation-templates.md) the way [the Orders blueprint](orders-blueprint.md) is: it brings no shell, component or theme of its own and adds what is particular to invoicing - five screen templates, two dialog templates, a screen set wired into navigation, and a sample-data pack. It is held to the same [definition of done](ship-your-own-blueprint.md#the-definition-of-done): `verifyBlueprintPackage` is green, every template passes the per-template check, and every screen and dialog is audited in Chromium at desktop, tablet and phone widths in the light and dark themes, colour contrast included.

## The screens

| Screen | Template | Foundation template | What it shows |
| --- | --- | --- | --- |
| `invoicing.overview` | `InvoicingOverview` | DashboardScreen | What is owed, what is overdue and what came in this month. |
| `invoicing.list` | `InvoicesList` | ListScreen | Every invoice with what is owed and its status. |
| `invoicing.record` | `InvoicePage` | RecordPage | One invoice: key facts, its lines, its payments and its activity. |
| `invoicing.payments` | `PaymentsList` | ListScreen | The payments received and the invoices they settled. |
| `invoicing.due` | `InvoicingDueDates` | the foundation `calendarGrid` | The day each invoice falls due, on a calendar. |
| (dialog) | `InvoicingQuickCreateInvoice` | QuickCreateDialog | The few fields to start a invoice. |
| (dialog) | `InvoicingRecordPayment` | QuickCreateDialog | The few fields to record a payment. |

The category is `Business / Invoicing`. Templates carry their `scopes` (Part A 4.2): the lists, boards, calendars, timelines, dashboards, inboxes and profiles apply at module and feature level, the record pages and wizards at feature and sub-feature level, and the dialogs at slice level.

## Navigation

The topbar names the module, `invoicing`; the module's sidebar overrides the application's and lists **Overview**, **Invoices**, **Payments** and **Due dates**. A screen is a feature of the `invoicing` module: `invoicing.overview` is the `overview` feature. The screen set (`invoicingScreenDefinitions`) is the one list the manifest's `blueprint.screenSet`, the `Screen` instances, the application structure and the navigation are all derived from, and a specification holds them to it.

## Behaviors

- choosing a row of **Invoices** opens its page, handing it the chosen row's id;
- **New invoice** opens the `InvoicingQuickCreateInvoice` dialog, whose button closes it;
- **Open the invoices** goes to `invoicing.list`;
- the calendar on **Due dates** keeps the day and the view in the address, so a link shares it as it is;
- the toolbar search narrows a list as it is typed and the search is part of the address.

## Sample data

`invoicing-en` (British English, pounds) holds invoicing data: twelve invoices for six customers from draft to paid, one invoice's lines and payments, the payments received and the receivables figures. Nothing in it is a real person or company.

## Adopting it

Install the package, add `Cratis.Blueprint.Invoicing` to the application's blueprints and reference a template by name from Screenplay:

```
screen Overview
  template blueprint Cratis.Blueprint.Invoicing InvoicingOverview version "^1.0"
```

A complete application built from it is [`Samples/Invoicing`](https://github.com/Cratis/Screenplay/tree/main/Samples/Invoicing) in Screenplay.
