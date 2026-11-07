---
title: Navigation regions
description: How an application stores its topbar and sidebar as outlets of navigation, how a module inherits, extends or overrides them, how an item targets a module or feature and a rendering slot, and the engine functions every host calls to get the effective items.
---

An application shell has two navigation **regions**, `topbar` and `sidebar`. The application defines their items;
each module may leave them as they are, add to them, or replace them. The engine resolves what a region effectively
shows - `effectiveNavigation` - so React renderers, Stage, Studio design mode and Studio preview all draw the same
items and nothing re-implements the rules.

A region is stored as an [outlet](outlets.md) of navigation named after it, and its buttons as an outlet of actions
named `<region>Buttons`. A navigation contribution point, such as `Navigation`, is an outlet of navigation too.
`effectiveNavigation` resolves them through `effectiveOutlet`, the same rule and the same provenance every outlet has.

## The model

`NavigationModel` (`@cratis/scene.model`, `Cratis.Scene.Model.Navigation`):

| Type | Properties |
| --- | --- |
| `NavigationModel` | `application`, `modules` |
| `ApplicationNavigation` | `outlets` (`Outlet[]`), `logo?` |
| `ModuleNavigation` | `module`, `refinements?` (`OutletRefinement[]`), `contributions?` (`OutletContribution[]`) |
| `OutletNavigationItem` | `kind: navigation`, `id`, `title`, `icon?`, `target?`, `slot?`, `children?`, `before?`, `after?` |
| `OutletButton` | `kind: button`, `id`, `title`, `slice?`, `emphasis?`, `icon?`, `authorize?`, `before?`, `after?` |
| `ApplicationLogo` | `image`, `title` |

```json
{
  "application": {
    "outlets": [
      { "name": "topbar", "kind": "navigation", "defaults": [
        { "kind": "navigation", "id": "sales", "title": "Sales", "target": { "module": "sales" } },
        { "kind": "navigation", "id": "support", "title": "Support", "target": { "module": "support" } } ] }
    ],
    "logo": { "image": "acme.svg", "title": "Acme" }
  },
  "modules": [
    { "module": "support", "refinements": [
      { "outlet": "topbar", "mode": "extends", "items": [
        { "kind": "navigation", "id": "help", "title": "Help center", "target": { "module": "support" } } ] } ] }
  ]
}
```

The shell always offers the `topbar` and `sidebar` outlets of navigation and their `topbarButtons` and
`sidebarButtons` outlets of actions; the application declares only the ones it gives default items to, and any other
outlet of navigation it offers. The application level has no mode: it is the base. A module refines an outlet only
when it changes it, with `inherits`, `extends` or `overrides`, `hide` and `before`/`after`, exactly as any outlet
refinement; an outlet it does not refine is inherited. Items a module contributes to an outlet
(`contributions`) follow the outlet's own items.

An item's **target** is a module, or a module and a feature (`feature` is a dotted path inside the module, so
`orders.returns` is a sub-feature). A module target goes to the module's **first feature**
(`ApplicationStructureIndex.firstFeature`). The **slot** is the slot the target renders into; `content` - the
primary slot - when absent. `children` are sub-items and belong to the sidebar: a topbar is flat, and sub-items
authored on a topbar item are ignored. A sidebar item that only groups sub-items needs no target of its own.

### Toolbar buttons

A region's **application-level toolbar buttons** are the outlet of actions `<region>Buttons` (`topbarButtons`,
`sidebarButtons`) - the Screenplay `button <id> title "..." slice <Slice>` of the topbar (Screenplay decision 0098). A
button opens the task dialog of its state change `slice` over the current page, as a screen's toolbar button does.
`emphasis` is `primary`, `secondary` (the default) or `quiet`; `authorize` names the policy the user needs to see it.
A module refines the buttons outlet on its own: an application button is shown in every module that inherits or
extends `topbarButtons`, a module that overrides it shows only its own.

## Effective items

```ts
const region = effectiveNavigation(structure, navigation, 'sales', NavigationRegionKind.Sidebar);
const contributed = effectiveNavigation(structure, navigation, 'sales', 'Navigation');
```

```csharp
var region = EffectiveNavigation.Resolve(index, navigation, "sales", NavigationRegionKind.Sidebar);
```

`module` is the module to resolve for; leave it out for the application itself. The last argument is the name of
the outlet of navigation - a region, or a contribution point such as `Navigation`. The result's `buttons`
(`EffectiveNavButton`: the button, its `origin`, `readOnly` and `reason`, `emphasis` resolved to its default) are the
resolved `<outlet>Buttons` outlet of actions.

| Mode | Effective items |
| --- | --- |
| *(application)* | the application items, editable |
| `inherits` | the application items, **read-only** |
| `extends` | the application items (read-only) less the ones the module hides, followed by the module's items |
| `overrides` | the module's items only |

Contributed items follow in every mode.

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
| `inherited` | `inherited` | `inherits` |
| `extended` | `Application + Sales` | `extends` |
| `overridden` | `Sales only` | `overrides` |

## Editing

The helpers plan the edits a gesture needs, so every host that offers the gesture makes the same change. They return
`{ edits, rejected? }`; `applyNavigationEdits` applies edits all-or-nothing to a copy and never changes the model it was given.

Every helper takes the navigation model, the module (`undefined` for the application) and the outlet, such as
`sidebar` or `topbarButtons`. C# has the same helpers on `NavigationEdits` (`SwitchOutletMode`, `AddItem`,
`RenameItem`, `MoveItem`, `DuplicateItem`, `RemoveItem`, `SetApplicationLogo`, `Apply`).

| Gesture | Helper | Edits |
| --- | --- | --- |
| Switch an outlet back to `inherits` | `switchOutletMode` | drops the module's refinement of the outlet - its items and what it hides (NAV3) |
| Switch `inherits` → `overrides` | `switchOutletMode(..., { copy: true })` | copies the application items into the module, then sets the mode (NAV5); without `copy` the module starts empty |
| "+" on an inherited outlet | `addNavigationItem` | switches the module to `extends`, then adds the item (NAV6) |
| Add a sub-item | `addNavigationItem(..., parent, index?)` | adds under the parent, at a position; not on the flat topbar |
| Rename | `renameNavigationItem` | replaces the item with its new title; an inherited item is renamed where it is defined |
| Move | `moveNavigationItem(..., { parent?, index? })` | moves to another position, under another item or to the top level; never under itself |
| Duplicate | `duplicateNavigationItem(..., newId?)` | adds a copy right after the item, with fresh ids (`<id>-copy`) for it and its sub-items |
| Delete | `removeNavigationItem` | removes one of the level's own items with its sub-items; an inherited item is hidden instead, switching to `extends` first |
| Set the logo | `setApplicationLogo` | refused for a module (NAV8); the logo is application-level only |

An item must be of a kind the outlet takes: navigation items in an outlet of navigation, buttons in a buttons outlet.
Adding a button to `topbarButtons` declares that standard outlet at the application when it has none yet. A switch
to the mode a module already has plans no edits. The application has no mode, so switching it is refused.

## Override is an extension of exposure

A region is a configurable collection that the application layout exposes and a module configures, so the modes are
the existing [exposure and configuration](../editing/exposure-and-configuration.md) model, not a parallel inheritance
system:

| Mode | Exposure model |
| --- | --- |
| `inherits` | no instance contribution; the owner's items are fixed (read-only) |
| `extends` | an instance contribution with `items`, appended after the owner's items - the existing behaviour |
| `overrides` | an instance contribution with `items` and `replaceOwnerItems`, using the new `replace` collection operation, which hides the owner's items |

`replace` is the one genuinely new rule: see *Replacing the owner's items* in that page.

## Diagnostics

`diagnoseNavigationOutlets(structure, navigation, { slots })` (`NavigationOutletDiagnostics.Diagnose`) checks the
application's outlets, then each module's refinements and contributions, and reports with the `entry`
`<module|application>:<outlet>:<itemId>` (so `application:topbarButtons:new-order` for a button):

| Code | Meaning |
| --- | --- |
| `navTargetMissing` | the item has no target (and no sub-items), or targets a module or feature the structure does not have; a button opens a slice the structure does not have |
| `navTargetOutOfScope` | a module's own item targets a different module (application items may target any module) |
| `navModuleWithoutFeatures` | a module target whose module has no feature to go to |
| `navSlotUnknown` | the item's slot is not one of the layout's slots (`content` only unless `slots` says otherwise) |
| `navDuplicateId` | an id is used twice in one level's outlet, or an extending module reuses an application item's (or button's) id |

Problems with the outlets themselves - a refinement of an outlet the application does not offer, an item of the wrong
kind, a hidden item that is not there - are the outlet diagnostics `diagnoseOutlets` reports over
`navigationOutletLevels(navigation, module)`.

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
  the primary region for `content`, the nested slot of that name otherwise (`core:slot`). Items that render into different slots are
  active at once, and closing a slot's screen clears its item. A topbar item that targets a module is also active on any screen of that module.
- **Render-into-slot.** Activating an item calls `navigate` with `navigationItemDestination(item)`: the module/feature identity, the screen
  (by default the qualified feature id, `sales.orders`; `screenFor` overrides it, and `moduleOf` says which module a screen not named by a qualified id belongs to, so the right sidebar is shown) and the slot as `slot`. A module target opens its first
  feature. `navigationDestinations(...)` lists every destination so deep links resolve; the host derives them from `navigationModel`.
  Outside a host the item announces `cratis.scene.navigate`.
- **Activation.** A click goes through `useNavigationActivation` (`@cratis/scene.react`): the host's `NavigationActivationProvider` policy decides
  whether it navigates or only selects (`navigationMode`, Alt-click) and is told of it (`onActivate`, `onNavigate`). An item with no target is drawn with
  `data-nav-problem="navTargetMissing"`; Enter on it reports a dead-target activation. See [the designer contract](ui-profile-designer-contract.md#navigation-rules).
- **Authorization.** `isVisible(item)` hides an item (and its sub-items); it never disables it. `isAuthorized(policy)` of the model hides a toolbar
  button that names a policy (`authorize`); without it every button is shown.
- **Buttons.** The region draws its effective `buttons` after the items in a `group` (`data-scene-nav-buttons`), each a `scene-toolbar-button`
  with its emphasis. Pressing a button with a slice opens the slice's task dialog through the navigation host; outside a host it announces the
  slice with `cratis.scene.command`. A button without a slice is disabled. Specs: `react/for_NavigationRegionView/when_a_region_declares_toolbar_buttons`.
- **Read-only hook.** Each item carries `data-origin` and `data-read-only`, and `renderAdornment(item)` lets a host add content (Studio draws the
  lock of an inherited item); Stage ignores it. The component draws no design chrome.
- **Keyboard and landmarks.** Each region is a labelled `nav` with one roving tab stop; arrows (left/right in a topbar, up/down in a sidebar),
  Home and End move between items; in a sidebar right expands and left collapses or goes to the parent.
- **The default blueprint.** `blueprint.default` `Topbar` and `Sidebar` show the region as the shell menu (the `layout-menu` classes) when a
  navigation model is in scope and the element has no `menu`/`content` slot of its own (`regionNavigation: false` opts out). The
  `core:navigationBar` component and the `Navigation` contribution are unchanged.

The specs render both shared corpora through the real navigation host (`react/for_NavigationRegionView`), audit the result with axe-core
(`blueprint.default/for_templateAccessibility`), and `shell/RegionNavigation.stories.tsx` shows it in Storybook.

## Stored documents from before outlets

A navigation model that lists `regions`, and a screen whose `contributions` carry navigation items for a contribution
point, are the shapes Scene 5 replaced. The document upgrader (`upgradeSlotShape`, `SlotShapeUpgrader` in C#)
rewrites them:

| Stored | Becomes |
| --- | --- |
| an application region with `items` | an outlet of navigation named after the region, its items the defaults |
| an application region's `buttons` | the `<region>Buttons` outlet of actions |
| a module region that `extend`s or `override`s | a refinement of that outlet with `extends` or `overrides` and its items |
| a module region that `inherit`s, or has no mode | nothing: an outlet a module does not refine is inherited |
| a module region's `buttons` | a refinement of `<region>Buttons` with the region's mode; an overriding region overrides the buttons too |
| navigation items a screen contributes to a contribution point | a contribution to the outlet of navigation of that name in `outletContributions`, ordered by `order`, a `group` becoming an item with the group's items as sub-items |

Validation on save refuses both old shapes (`legacyNavigationShape`, `legacyNavigationContribution`). The cases are in
`slot-shape-fixtures.json`.

## Shared fixtures

Both engines are asserted against `navigation-inheritance-fixtures.json` (inherit, extend, override, per-region
independence, copying on inherit → override, a module without a navigation block, hierarchical items, duplicate ids,
unknown slots, and the edit helpers) and `navigation-targets-fixtures.json` (module → first feature, feature
targets, a module without features, targets in a different module, unknown targets), plus the new codes in
`navigation-diagnostic-fixtures.json`. The C# spec is `Engine.Specs/for_EffectiveNavigation`; the TypeScript spec is
`engine/for_effectiveNavigation`. The shapes are mirrored in `scene-model-shape.json`.
