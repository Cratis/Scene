---
title: Rendering outlets and routed slots
description: How @cratis/scene.react draws the outlets a template offers - actions, filters, tabs, stats and navigation - draws routed slots and docked panels, and hands routing to the host through the SceneRouter seam.
---

`@cratis/scene.react` draws what the engine resolves and adds no rules of its own: which items an outlet shows comes from
`effectiveOutlet`, where an action's slice opens from `resolvePlacement`, and whether it is enabled from
`resolveEnablement` (see [outlets](outlets.md) and [placement](placement.md)). The renderer turns those answers into
controls, and asks the host to change the URL.

## Drawing an outlet

A template or screen places an outlet with the `core:outletItems` component.

| Property | Meaning |
| --- | --- |
| `name` | The outlet, such as `toolbar` or `filters`. |
| `kind`, `subject`, `slot`, `items` | The outlet the element declares itself, drawn when no page around it declares one by that name. |
| `item` | What an outlet of actions `for item` acts on, usually bound to a table's selected row. |

Inside a `SceneOutletsProvider` the element draws what the page's chain resolves: the defaults of the layout or template,
and what modules, features, slices and screens extend, override, hide and contribute. A host that resolves an outlet
itself draws it with `OutletView`.

```tsx
<SceneOutletsProvider value={{ chain, contributors, slices, slots, persona }}>
    <SceneElementView element={screen} registry={coreComponents} />
</SceneOutletsProvider>
```

| Value | What it gives the outlets |
| --- | --- |
| `chain`, `contributors` | The levels the outlets resolve through, from the top down, and the levels outside the chain that contribute. |
| `slices` | The slices the actions run: screen, fits, inputs and authorization (`ActionSlice`). |
| `slots` | The page's slots as placement sees them (`placementSlotsOf`). |
| `persona`, `conditions` | Who sees the page, and the host's answer to each action's `enabled when`. |
| `filterChoices` | The choices of each filter with the `choice` control, by filter id. |
| `defaultDialogTemplate` | The dialog a slice that names none opens in; `FormDialog` when absent. |

## What each kind draws

| Kind | Drawn as |
| --- | --- |
| `actions` | A toolbar. Buttons in order, separators between them, a group as a menu, and menu entries outside any group in a trailing **More** menu. |
| `filters` | A control per filter, chosen by its `control`: a search box, choice chips, a range (written as `min..max`) or a date. Each writes the query parameter it `sets`; one that sets none writes a parameter named after its id. |
| `tabs` | The tabs, and below them the slot the outlet owns showing the chosen tab's screen. The first tab is chosen until another is. |
| `stats` | Each stat's label, its value from a field of a single-result query (the first row of a list) and its trend, pointing up, down or flat. A stat whose query has no result yet shows a dash. |
| `navigation` | Each item's title and icon, its sub-items nested below it, and the item of the current screen marked. An item without a target is a heading. |

An action is drawn the way inspection (`inspectOutletActions`) says:

- **Hidden** when the persona cannot issue its command.
- **Disabled** when a check holds it back - it waits for a selection, or its `enabled when` does not hold - or when its
  slice cannot open where it asks. The reason is the control's tooltip and its accessible description.
- **Enabled** otherwise.

Choosing an enabled action does what placement decided:

| Decision | What happens |
| --- | --- |
| Run directly (`none`) | The slice invoker (`SliceInvokerProvider`) invokes the slice with the inputs the item and the route feed. |
| `dialog`, `drawer` | The slice's screen opens over the page through the navigation host. A drawer carries `data-scene-presentation="drawer"`. Neither changes the URL. |
| `slot` | The screen opens in the slot through the router, with the slot's route values - from the page, or from the item it acts on - and the slice's segment. |

A built-in (`builtIn`) is announced with the `cratis.scene.builtIn` event, and `close` also closes the dialog it sits in. A
navigation target goes through the navigation host, or is announced with `cratis.scene.navigate` outside one. An action
whose confirmation is set asks first.

## Slots by role

`core:slot` takes the `role`, `routed`, `routedBy` and `optional` of the slot it draws.

- A **routed** slot shows what the router says it shows, and carries its route - parameter values and segment - as
  `data-scene-slot-route`, such as `NK-101/set-product-price`.
- A **panel** is drawn as a landmark (`aside`) docked beside the content. It is never routed.
- An **optional** slot is hidden until something fills it; an optional pane or panel can be closed.

## The routing seam

Scene does not own a router. The renderer reads a `SceneRouteState` and asks a `SceneRouter` to change it; the host maps
both to its own router and URL.

| State | Meaning |
| --- | --- |
| `slots` | What each routed slot shows: the screen, its route parameter values and the segment after them. |
| `tabs` | The tab chosen in each outlet of tabs. |
| `query` | The values the filters wrote, by query parameter name. |

`SceneRouter` adds `openInSlot`, `closeSlot`, `selectTab` and `setQueryParameter`. Give the renderer the host's router
with `SceneRouterProvider` or the `router` property of `SceneNavigationHost`; without one, the state is kept in memory
(`useMemorySceneRouter`), which suits previews and specifications.

The URL encoding is shared, so every host writes the same URL:

| Helper | Does |
| --- | --- |
| `routedSlotPath(route, routedBy)` | Writes a routed slot's part of the path: the parameter values in order, then the segment. |
| `parseRoutedSlotPath(path, routedBy)` | Reads it back. |
| `sceneRouteQueryString(query)` | Writes the filters' values as a query string, such as `?q=kettle&status=onSale`. |
| `parseSceneRouteQuery(search)` | Reads it back. |
| `slotRouteFromPlacement(decision, screen)` | Turns a placement decision that opens in a routed slot into what the slot shows. |
| `withSlotOpened`, `withSlotClosed`, `withTabSelected`, `withQueryParameter` | Pure state changes a host router can reuse. |

A query the screen shows reads the filters' values with `useSceneQueryParameters`.

## The toolbar is an outlet of actions

The `core:toolbar` component and its `core:toolbarItem` items are gone: a screen's toolbar is an outlet of actions drawn
by `core:outletItems`. The document upgrader (`upgradeSlotShape`, `SlotShapeUpgrader` in C#) rewrites a stored toolbar
element. Its `name` names the outlet, `toolbar` when it names none. Each item becomes a button: its slice, its navigation
target or dialog as `navigateTo`, or its hand-typed command as `command`, with its title, icon, emphasis and
confirmation. A toolbar that holds something a button cannot carry is reported and kept as it was:

- an element that is not a toolbar item;
- presentation hints other than showing both icon and text;
- parameters passed to a command.

Saving refuses a document that still has either element (`legacyToolbarElement`). For a Screenplay source, run
`screenplay migrate --from 5 --to 6`.
