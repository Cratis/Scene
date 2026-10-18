---
title: The Catalog blueprint
description: Products and categories for a sales team - a catalog overview, a product list, a product page with its variants and price history, and the categories they sit in.
---

`@cratis/scene.blueprint.catalog` is a **domain blueprint** built on the [foundation set](foundation-templates.md) the way [the Orders blueprint](orders-blueprint.md) is: it brings no shell, component or theme of its own and adds what is particular to catalog - four screen templates, two dialog templates, a screen set wired into navigation, and a sample-data pack. It is held to the same [definition of done](ship-your-own-blueprint.md#the-definition-of-done): `verifyBlueprintPackage` is green, every template passes the per-template check, and every screen and dialog is audited in Chromium at desktop, tablet and phone widths in the light and dark themes, colour contrast included.

## The screens

| Screen | Template | Foundation template | What it shows |
| --- | --- | --- | --- |
| `catalog.overview` | `CatalogOverview` | DashboardScreen | How the catalog is doing: what is live, what is out of stock and what changed lately. |
| `catalog.products` | `ProductsList` | ListScreen | Every product with its price, stock and status. |
| `catalog.record` | `ProductPage` | RecordPage | One product: key facts, its variants, its price history and its activity. |
| `catalog.categories` | `CategoriesList` | ListScreen | The categories products sit in and who owns them. |
| (dialog) | `CatalogQuickCreateProduct` | QuickCreateDialog | The few fields to start a product. |
| (dialog) | `CatalogQuickCreateCategory` | QuickCreateDialog | The few fields to start a category. |

The category is `Business / Catalog`. Templates carry their `scopes` (Part A 4.2): the lists, boards, calendars, timelines, dashboards, inboxes and profiles apply at module and feature level, the record pages and wizards at feature and sub-feature level, and the dialogs at slice level.

## Navigation

The topbar names the module, `catalog`; the module's sidebar overrides the application's and lists **Overview**, **Products** and **Categories**. A screen is a feature of the `catalog` module: `catalog.overview` is the `overview` feature. The screen set (`catalogScreenDefinitions`) is the one list the manifest's `blueprint.screenSet`, the `Screen` instances, the application structure and the navigation are all derived from, and a specification holds them to it.

## Behaviors

- choosing a row of **Products** opens its page, handing it the chosen row's id;
- **New product** opens the `CatalogQuickCreateProduct` dialog, whose button closes it;
- **New category** opens the `CatalogQuickCreateCategory` dialog, whose button closes it;
- the toolbar search narrows a list as it is typed and the search is part of the address.

## Sample data

`catalog-en` (British English, pounds) holds product catalog: twelve products in six categories, one product's variants and price history, stock health and recent changes. Nothing in it is a real person or company.

## Adopting it

Install the package, add `Cratis.Blueprint.Catalog` to the application's blueprints and reference a template by name from Screenplay:

```
screen Overview
  template blueprint Cratis.Blueprint.Catalog CatalogOverview version "^1.0"
```

A complete application built from it is [`Samples/Catalog`](https://github.com/Cratis/Screenplay/tree/main/Samples/Catalog) in Screenplay.
