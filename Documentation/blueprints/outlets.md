---
title: Outlets
description: How a layout or template offers lists of items - actions, filters, tabs, stats and navigation - with defaults, how modules, features, slices and screens inherit, extend or override them, how any level contributes to one, and how the engine resolves an outlet with the provenance of every item.
---

An **outlet** is a list of items a layout or template offers, such as a toolbar, the filters above a table or the tabs
of a detail pane. It is not a [slot](layouts.md): a slot is a region content is placed in, an outlet is a list of
items. A template declares an outlet with its default items; every level below it - module, feature, slice, screen -
inherits it, extends it or overrides it, and any level can contribute to it. The engine resolves what an outlet
effectively shows with `effectiveOutlet` (`EffectiveOutlets.Resolve` in C#), so Stage, Studio and the renderers show
the same items and say where each one comes from.

## Kinds and their items

Every outlet has a kind, and the kind decides which items it takes. Each item has a `kind` and an `id`; `hide`,
`before` and `after` name items by their id.

| Outlet kind | Items | An item binds to |
| --- | --- | --- |
| `actions` | `button`, `menuEntry`, `separator`, `group` (of buttons, menu entries and separators) | a State Change slice (a hook), a navigation target (`navigateTo`) or a built-in (`runs`: `close`, `submit`, `refresh`) |
| `filters` | `filter`: `title`, `control` (`search`, `choice`, `range`, `date`), `sets` (`query`, `parameter`) | a parameter of the query the screen shows |
| `tabs` | `tab`: `title`, `shows` | a screen, shown in the slot the outlet owns (`slot`) |
| `stats` | `stat`: `title`, `valueFrom` (`query`, `field`), `trend` | a field of a single-result query |
| `navigation` | `navigation`: `title`, `icon`, `target`, `slot`, `children` | a module, feature or screen |

A button and a menu entry also carry `subject` (`item` or `screen`), `enabledWhen`, `confirm`, `authorize`, `opens`
(`automatic`, `none`, `dialog`, `drawer`, `slot`) and `opensIn`. Only an outlet of actions has a `subject`. Where an
action's slice opens and whether the action is enabled are worked out by [placement and enablement](placement.md).

## Declaring and refining

| Type | Properties |
| --- | --- |
| `Outlet` | `name`, `kind`, `subject?`, `slot?`, `defaults` |
| `OutletRefinement` | `outlet`, `mode?` (`inherits`, `extends`, `overrides`), `items?`, `hide?` |
| `OutletContribution` | `outlet`, `items` |

Layouts, screen templates and dialog templates declare `outlets`. Every dialog and drawer template offers the
`actions` outlet with Cancel (`runs close`) and Submit (`runs submit`, primary); `dialogTemplateOutlets`
(`DialogTemplateOutlets.Of`) returns it first unless the template declares its own `actions` outlet.

A refinement without a `mode` extends when it has items or hides, and inherits otherwise.

- `inherits` keeps the inherited items unchanged.
- `extends` keeps them, minus the hidden ones, and adds the level's own items after them.
- `overrides` replaces them with the level's own items; the inherited ones are listed as overridden.

An item without `before` or `after` always goes last, so a level's own items never move above the ones it inherits.
`before` and `after` place an item next to the item they name.

## Resolving an outlet

`effectiveOutlet(chain, outlet, contributors)` takes the levels from the top down - each an `OutletLevel` with a
`kind` (`layout`, `template`, `module`, `feature`, `slice`, `screen`), a `name`, and its `outlets`, `refinements` and
`contributions` - and resolves the outlet for the last level. `contributors` are levels outside the chain, such as
another feature that contributes a tab.

The result, `EffectiveOutlet`, has:

- `items`, each with its `provenance` (`owner`, `level`, `source`: `default`, `own` or `contribution`) and whether the
  last level can edit it.
- `removed`: the inherited items that are hidden or overridden, with the level that removed them.
- `mode`: how the last level treats the outlet; absent when that level declares it.
- `sources` and `summary`, such as `Catalog + Products`: the declaring level, then each level that extended, overrode
  or contributed.
- `diagnostics`.

`diagnoseOutlets` (`OutletDiagnostics.Diagnose`) checks every outlet of a chain.

| Code | Severity | When |
| --- | --- | --- |
| `unknownOutlet` | error | No level declares the outlet asked for. |
| `duplicateOutlet` | error | A level declares an outlet a level above it already declares. |
| `refinementOfUnknownOutlet` | error | A level refines an outlet no level above it declares. |
| `contributionToUnknownOutlet` | error | A level contributes to an outlet no level declares. |
| `hiddenItemMissing` | warning | A level hides an item the outlet it inherits does not have. |
| `placementTargetMissing` | warning | `before` or `after` names an item the outlet does not have; the item goes last. |
| `itemKindMismatch` | error | An item is of a kind the outlet (or group) does not take; it is left out. |
| `duplicateItemId` | error | An item has the id of an item the outlet already has; it is left out. |
| `itemsIgnoredWhenInheriting` | warning | A level inherits unchanged but has items or hides. |
| `tabsNeedSlot` | error | An outlet of tabs names no slot. |
| `subjectOnlyForActions` | warning | An outlet that is not of actions names a subject. |

## What outlets replace

- [Navigation regions](navigation-regions.md) are stored as outlets of navigation on the application's navigation
  (`navigation.application.outlets`), and a region's buttons as an outlet of actions (`topbarButtons`,
  `sidebarButtons`). A module refines them (`modules[].refinements`) and contributes to them
  (`modules[].contributions`). `effectiveNavigation` resolves them through `effectiveOutlet`;
  `navigationOutletLevels` (`NavigationOutlets.Levels`) is the chain a navigation model is.
- A navigation contribution point is an outlet of navigation, such as `Navigation`. A screen contributes navigation
  items to it in its `outletContributions`, which resolve like any other contribution.
- The document upgrader rewrites a stored navigation model that lists `regions` into outlets and refinements, and a
  screen's navigation items contributed to a contribution point into `outletContributions`. Validation on save
  rejects both old shapes (`legacyNavigationShape`, `legacyNavigationContribution`).
- A feature or module toolbar, whose buttons every screen's toolbar got, is a refinement that extends the `toolbar`
  outlet (`toolbarAsOutletRefinement`, `ToolbarOutlet.AsRefinement`). The document upgrader (`upgradeSlotShape`,
  `SlotShapeUpgrader`) rewrites a stored `toolbar: { buttons }` into the owner's `refinements`, and validation on save
  rejects the old shape (`legacyToolbarShape`) and an outlet of an unknown kind (`unknownOutletKind`).

Both engines assert the shared `outlet-resolution-fixtures.json` corpus.
