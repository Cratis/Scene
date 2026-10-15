---
title: Navigation regions
description: How an application defines its topbar and sidebar, how a module inherits, extends or overrides them, how an item targets a module or feature and a rendering slot, and the engine functions every host calls to get the effective items.
---

An application shell has two navigation **regions**, `topbar` and `sidebar`. The application defines their items;
each module may leave them as they are, add to them, or replace them. The engine resolves what a region effectively
shows - `effectiveNavigation` - so React renderers, Stage, Studio design mode and Studio preview all draw the same
items and nothing re-implements the rules.

## The model

`NavigationModel` (`@cratis/scene.model`, `Cratis.Scene.Model.Navigation`):

| Type | Properties |
| --- | --- |
| `NavigationModel` | `application`, `modules` |
| `ApplicationNavigation` | `regions`, `logo?` |
| `ModuleNavigation` | `module`, `regions` |
| `NavigationRegion` | `region` (`topbar` \| `sidebar`), `mode?`, `items` |
| `NavItem` | `id`, `title`, `icon?`, `target?`, `slot?`, `children?` |
| `ApplicationLogo` | `image`, `title` |

```json
{
  "application": {
    "regions": [
      { "region": "topbar", "items": [
        { "id": "sales", "title": "Sales", "target": { "module": "sales" } },
        { "id": "support", "title": "Support", "target": { "module": "support" } } ] }
    ],
    "logo": { "image": "acme.svg", "title": "Acme" }
  },
  "modules": [
    { "module": "support", "regions": [
      { "region": "topbar", "mode": "extend", "items": [
        { "id": "help", "title": "Help center", "target": { "module": "support" } } ] } ] }
  ]
}
```

The application level has no `mode`: it is the base. A module declares a region only when it changes it; a region it
does not declare, or declares without a `mode`, is `inherit`.

An item's **target** is a module, or a module and a feature (`feature` is a dotted path inside the module, so
`orders.returns` is a sub-feature). A module target goes to the module's **first feature**
(`ApplicationStructureIndex.firstFeature`). The **slot** is the outlet the target renders into; `content` - the
primary outlet - when absent. `children` are sub-items and belong to the sidebar: a topbar is flat, and sub-items
authored on a topbar item are ignored. A sidebar item that only groups sub-items needs no target of its own.

## Effective items

```ts
const region = effectiveNavigation(structure, navigation, 'sales', NavigationRegionKind.Sidebar);
```

```csharp
var region = EffectiveNavigation.Resolve(index, navigation, "sales", NavigationRegionKind.Sidebar);
```

`module` is the module to resolve for; leave it out for the application itself.

| Mode | Effective items |
| --- | --- |
| *(application)* | the application items, editable |
| `inherit` | the application items, **read-only**; the module's own items are cleared |
| `extend` | the application items (read-only) followed by the module's items |
| `override` | the module's items only |

Each item says where it came from, so a designer can draw the locked, violet inherited items and the region tag:

| Property | Meaning |
| --- | --- |
| `origin` | `application` or `module` - which level defined the item |
| `readOnly` | `true` for an application item seen from a module |
| `reason` | a sentence saying why the item is there and whether it can be edited here |
| `target` | `{ module, feature?, resolvedFeature? }`; `resolvedFeature` is the qualified id the item opens, absent when it leads nowhere |
| `slot` | the slot the target renders into |
| `children` | resolved sub-items (sidebar) |

The region itself carries `mode` (the effective mode) and `sources`, the compact tag text:

| `sources.kind` | `sources.label` | When |
| --- | --- | --- |
| `definedHere` | `defined here` | the application level |
| `inherited` | `inherited` | `inherit` |
| `extended` | `Application + Sales` | `extend` |
| `overridden` | `Sales only` | `override` |

## Editing

The helpers plan the edits a gesture needs, so every host that offers the gesture makes the same change. They return
`{ edits, rejected? }`; `applyNavigationEdits` applies edits all-or-nothing to a copy and never changes the model it was given.

| Gesture | Helper | Edits |
| --- | --- | --- |
| Switch a region to `inherit` | `switchRegionMode` | clears the module items, sets the mode (NAV3) |
| Switch `inherit` → `override` | `switchRegionMode(..., { copy: true })` | copies the application items into the module, then sets the mode (NAV5); without `copy` the module starts empty |
| "+" on an inheriting region | `addNavItem` | switches the region to `extend`, then adds the item (NAV6) |
| Add a sub-item | `addNavItem(..., parent)` | adds under the parent; sidebar only |
| Set the logo | `setApplicationLogo` | refused for a module (NAV8); the logo is application-level only |

A switch to the mode a region already has plans no edits. The application has no mode, so switching it is refused.

## Override is an extension of exposure

A region is a configurable collection that the application layout exposes and a module configures, so the modes are
the existing [exposure and configuration](../editing/exposure-and-configuration.md) model, not a parallel inheritance
system:

| Mode | Exposure model |
| --- | --- |
| `inherit` | no instance contribution; the owner's items are fixed (read-only) |
| `extend` | an instance contribution with `items`, appended after the owner's items - the existing behaviour |
| `override` | an instance contribution with `items` and `replaceOwnerItems`, using the new `replace` collection operation, which hides the owner's items |

`replace` is the one genuinely new rule: see *Replacing the owner's items* in that page.

## Diagnostics

`diagnoseNavigationRegions(structure, navigation, { slots })` (`NavigationRegionDiagnostics.Diagnose`) reports, with the
`entry` `<module|application>:<region>:<itemId>`:

| Code | Meaning |
| --- | --- |
| `navTargetMissing` | the item has no target (and no sub-items), or targets a module or feature the structure does not have |
| `navTargetOutOfScope` | a module's own item targets a different module (application items may target any module) |
| `navModuleWithoutFeatures` | a module target whose module has no feature to go to |
| `navSlotUnknown` | the item's slot is not one of the layout's slots (`content` only unless `slots` says otherwise) |
| `navDuplicateId` | an id is used twice in one level's region, or an extending module reuses an application item's id |

`diagnoseNavigation` runs the same check when its graph carries `structure` and `navigation`. See
[Navigation diagnostics](navigation-diagnostics.md).

## Rendering the regions: `NavigationRegionView`

`@cratis/scene.react` renders a region's effective items; the same component serves Stage, the Studio preview and generated React,
so nothing about inheritance or hierarchy is re-implemented in a renderer (spec REN2).

```tsx
<SceneNavigationHost
    screens={screens} initialScreen='dashboard.overview' registry={registry}
    navigationModel={{ structure, navigation, isVisible: item => allowed(item) }}
    frame={content => <><Topbar /><Sidebar />{content}</>} />
```

- **Source.** `navigationModel` (the structure and the navigation) is provided to every `NavigationRegionView` below the host
  (`SceneNavigationModelProvider` when there is no host). The region is `effectiveNavigation(...)` for the module of the screen on the
  page, so navigating to another module recomputes the items in place - the `nav` node is not remounted. Pass `module` or
  `application` to pin it.
- **Hierarchy.** A topbar is flat. A sidebar nests: a parent has an expand/collapse button (`aria-expanded`), and the parents of the active
  item are expanded (`expand='all'` shows everything for a design layer).
- **Active state.** An item is active (`aria-current='page'`, `data-active`) when the screen it opens is shown in the slot it renders into:
  the primary region for `content`, the nested outlet of that name otherwise (`core:outlet`). Items that render into different slots are
  active at once, and closing a slot's screen clears its item. A topbar item that targets a module is also active on any screen of that module.
- **Render-into-slot.** Activating an item calls `navigate` with `navigationItemDestination(item)`: the module/feature identity, the screen
  (by default the qualified feature id, `sales.orders`; `screenFor` overrides it, and `moduleOf` says which module a screen not named by a qualified id belongs to, so the right sidebar is shown) and the slot as `outlet`. A module target opens its first
  feature. `navigationDestinations(...)` lists every destination so deep links resolve; the host derives them from `navigationModel`.
  Outside a host the item announces `cratis.scene.navigate`.
- **Authorization.** `isVisible(item)` hides an item (and its sub-items); it never disables it.
- **Read-only hook.** Each item carries `data-origin` and `data-read-only`, and `renderAdornment(item)` lets a host add content (Studio draws the
  lock of an inherited item); Stage ignores it. The component draws no design chrome.
- **Keyboard and landmarks.** Each region is a labelled `nav` with one roving tab stop; arrows (left/right in a topbar, up/down in a sidebar),
  Home and End move between items; in a sidebar right expands and left collapses or goes to the parent.
- **The default blueprint.** `blueprint.default` `Topbar` and `Sidebar` show the region as the shell menu (the `layout-menu` classes) when a
  navigation model is in scope and the element has no `menu`/`content` slot of its own (`regionNavigation: false` opts out). The
  `core:navigationBar` component and the `Navigation` contribution are unchanged.

The specs render both shared corpora through the real navigation host (`react/for_NavigationRegionView`), audit the result with axe-core
(`blueprint.default/for_templateAccessibility`), and `shell/RegionNavigation.stories.tsx` shows it in Storybook.

## Existing `Navigation` contributions

The `Navigation` contribution point and the `core:navigation` component are unchanged: legacy and generated
navigation keep rendering as before. A host that wants such items in a region supplies them as application items.

## Shared fixtures

Both engines are asserted against `navigation-inheritance-fixtures.json` (inherit, extend, override, per-region
independence, copying on inherit → override, a module without a navigation block, hierarchical items, duplicate ids,
unknown slots, and the edit helpers) and `navigation-targets-fixtures.json` (module → first feature, feature
targets, a module without features, targets in a different module, unknown targets), plus the new codes in
`navigation-diagnostic-fixtures.json`. The C# spec is `Engine.Specs/for_EffectiveNavigation`; the TypeScript spec is
`engine/for_effectiveNavigation`. The shapes are mirrored in `scene-model-shape.json`.
