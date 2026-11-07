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
| `actions` | `button`, `menuEntry`, `separator`, `group` (of buttons, menu entries and separators) | a State Change slice (a hook), a navigation target (`navigateTo`) or a built-in (`builtIn`: `close`, `submit`, `refresh`) |
| `filters` | `filter`: `title`, `control` (`search`, `choice`, `range`, `date`), `sets` (`query`, `parameter`) | a parameter of the query the screen shows |
| `tabs` | `tab`: `title`, `shows` | a screen, shown in the slot the outlet owns (`slot`) |
| `stats` | `stat`: `title`, `valueFrom` (`query`, `field`), `trend` | a field of a single-result query |
| `navigation` | `navigation`: `title`, `icon`, `target`, `slot`, `children` | a module, feature or screen |

A button and a menu entry also carry `subject` (`item` or `screen`), `enabledWhen`, `confirm`, `authorize`, `opens`
(`automatic`, `none`, `dialog`, `drawer`, `slot`) and `opensIn`. Only an outlet of actions has a `subject`. Where an
action's slice opens and whether the action is enabled are worked out by [placement and enablement](placement.md).

An item names its type in `kind`, and TypeScript may write `kind` after the other properties. In C#, read outlet items
with `SceneJson.Options`, or pass a host's own `JsonSerializerOptions` through `SceneJson.Configure` before using them.
Both turn on `AllowOutOfOrderMetadataProperties`; without it `System.Text.Json` cannot read an item whose `kind` is not
first.

## Declaring and refining

| Type | Properties |
| --- | --- |
| `Outlet` | `name`, `kind`, `subject?`, `slot?`, `defaults` |
| `OutletRefinement` | `outlet`, `mode?` (`inherits`, `extends`, `overrides`), `items?`, `hide?` |
| `OutletContribution` | `outlet`, `items` |

Layouts, screen templates and dialog templates declare `outlets`. Every dialog and drawer template offers the
`actions` outlet with Cancel (`builtIn: close`) and Submit (`builtIn: submit`, primary); `dialogTemplateOutlets`
(`DialogTemplateOutlets.Of`) returns it first unless the template declares its own `actions` outlet.

A refinement without a `mode` extends when it has items or hides, and inherits otherwise.

- `inherits` keeps the inherited items unchanged.
- `extends` keeps them, minus the hidden ones, and adds the level's own items after them.
- `overrides` replaces the inherited items (the defaults and what the levels above added) with the level's own items;
  the inherited ones are listed as overridden. Contributions are not inherited items: they belong to the module or
  feature that contributed them, so they still apply after an override.

The order is always inherited items, then the level's own items, then contributions. A level's own items never move
above the ones it inherits:

- An item without `before` or `after` goes last in its group.
- `before` and `after` place an item next to an item of its own group: one of the level's own items, or another
  contribution.
- `after` an inherited item puts it first after the inherited items.
- `before` an inherited item does the same and reports `placementAboveInherited`.

Contributions are ordered the same way among themselves. Each keeps its provenance.

`hide <id>` works on any item the outlet would show, including a contributed one. A hide that names no inherited item
is applied once the contributions are added, and is reported as `hiddenItemMissing` only if no contribution has that id
either.

## Resolving an outlet

`effectiveOutlet(chain, outlet, contributors)` takes the levels from the top down - each an `OutletLevel` with a
`kind` (`layout`, `template`, `module`, `feature`, `slice`, `screen`), a `name`, and its `outlets`, `refinements` and
`contributions` - and resolves the outlet for the last level. `contributors` are levels outside the chain, such as
another feature that contributes a tab.

A host does not assemble the chain itself. `outletChainOf(source, screen)` (`OutletChains.Of`) builds it for a screen
from an `OutletChainSource`: the `layouts`, `screenTemplates` and `screens` of a Scene document, the `navigation`
model, and the host's `levels` for modules and features. The chain is, from the top down:

1. the application level of the navigation model;
2. the screen's layout;
3. its screen template;
4. a level for each name in the screen's `path`: the first a module, the rest features. A module's navigation
   refinements and contributions, and the host's level of that name, join it;
5. the screen, with its `outletContributions`.

Every other screen's outlet contributions, every other module's navigation contributions and every host level not on
the path become the `contributors`.

```ts
const { chain, contributors } = outletChainOf({ ...document, navigation, levels: featureLevels }, 'ProductList');
const toolbar = effectiveOutlet(chain, 'toolbar', contributors);
```

The result, `EffectiveOutlet`, has:

- `items`, each with its `provenance` (`owner`, `level`, `source`: `default`, `own` or `contribution`) and whether the
  last level can edit it.
- `removed`: the inherited or contributed items that are hidden, and the inherited items that are overridden, with the
  level that removed them.
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
| `hiddenItemMissing` | warning | A level hides an item the outlet neither inherits nor receives as a contribution. |
| `placementTargetMissing` | warning | `before` or `after` names an item the outlet does not have; the item goes last. |
| `placementAboveInherited` | warning | `before` names an inherited item, or a contribution names an inherited or own item; the item goes first after them. |
| `itemKindMismatch` | error | An item is of a kind the outlet (or group) does not take; it is left out. |
| `duplicateItemId` | error | An item has the id of an item the outlet already has; it is left out. |
| `itemsIgnoredWhenInheriting` | warning | A level inherits unchanged but has items or hides. |
| `tabsNeedSlot` | error | An outlet of tabs names no slot. |
| `subjectOnlyForActions` | warning | An outlet that is not of actions names a subject. |

Saving a document also checks every outlet item it stores: the defaults of each outlet it declares, and the items of its
`refinements`, `contributions` and `outletContributions`. `validateSlotShape` (`SlotShapeValidator.Validate`) refuses the
save with `invalidSlotShape` when an item has no known kind (`unknownOutletItemKind`), is of a kind its outlet or group
does not take (`outletItemKindMismatch`), or lacks what its kind needs: an id, a title, the screen a tab `shows` or the
`items` of a group (`incompleteOutletItem`). The kind of a refined or contributed outlet is declared elsewhere, so only
the defaults are checked against their outlet's kind.

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
- A screen's `core:toolbar` element, whose `items` slot held `core:toolbarItem` elements, is the `core:outletItems`
  element that draws an outlet of actions. The upgrader rewrites it, and validation on save rejects both old elements
  (`legacyToolbarElement`). [Rendering outlets](rendering-outlets.md) says how each kind is drawn.

Both engines assert the shared `outlet-resolution-fixtures.json` corpus.
