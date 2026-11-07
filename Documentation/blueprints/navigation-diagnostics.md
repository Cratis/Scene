---
title: Navigation diagnostics
description: What navigation diagnostics report for destinations, slots, routes and targets, and how a renderer compares routes by the URLs it builds.
---

A destination that names a missing slot, opens a screen that was renamed, or places a screen inside itself fails only when someone clicks it. Navigation diagnostics find those problems in the model, before anything renders.

## Run the diagnostics

`diagnoseNavigation(graph)` in `@cratis/scene.engine` checks a `NavigationGraph`: the `entries` to check, each a destination with an optional stable `id`, and the `screens`, `layouts`, `screenTemplates` and `dialogTemplates` they refer to. `navigationEntriesFrom(items)` turns `NavigationItem` contributions into entries, including legacy items that carry only `targetScreen`.

A catalog left out of the graph is unknown, so its targets are not reported as unavailable. An empty catalog is known to be empty.

The C# twin is `NavigationDiagnostics.Diagnose`. Both engines run the shared `navigation-diagnostic-fixtures.json` corpus, which holds a negative case for every code.

## Diagnostic codes

| Code | Reported when |
| --- | --- |
| `duplicateRoute` | Two destinations occupy the same route but open different targets. Destinations to the same target may share a route. |
| `duplicateSlot` | Two layouts or screen templates declare a routed slot with the same name. A destination names a slot only by name, so the two are ambiguous. |
| `missingSlot` | A destination names a slot that no layout or screen template declares as routed. |
| `incompatibleSlot` | A dialog or external destination names a slot; a screen is placed in a layout's slot but renders in another layout; or the slot's `accepts` list does not include the screen's template type. |
| `navigationCycle` | Screens are placed in slots owned by each other's templates, including a screen placed in a slot its own template owns, so composition never terminates. |
| `unavailableTarget` | A destination names nothing to open, a dialog destination names no dialog, or it opens a screen or dialog template that does not exist. |
| `navTargetMissing` | A navigation region item has no target (and no sub-items), or targets a module or feature the application structure does not have. |
| `navSlotUnknown` | A navigation region item renders into a slot the layout does not declare. |
| `navDuplicateId` | Two items of one navigation region share an id - within a level, or between an extending module and the application. |
| `navModuleWithoutFeatures` | A navigation region item targets a module that has no feature to go to. |
| `navTargetOutOfScope` | A module's own navigation region item targets a different module. |

The last five check the application's navigation regions against its [application structure](application-structure.md):
give the graph a `structure` and `navigation` (and `slots`, `content` only when absent) and `diagnoseNavigation` reports
them after the others. `diagnoseNavigationRegions` runs just that check. See [Navigation regions](navigation-regions.md).

Each diagnostic carries the `entry` it was found on, either its `id` or `#<position>`. Slot duplicates and cycles concern the whole model and carry no entry.

## Restrict what a slot hosts

A slot can list the template types it accepts:

```typescript
slots: [{ name: 'detail', routed: true, accepts: ['Detail', 'Form'] }]
```

A destination that places a screen of another type there, or a screen with no template type, is reported as `incompatibleSlot`. Leave `accepts` out to accept any screen.

## Routes in the engine and in the renderer

The engine constructs no URLs, so by default it compares only authored route overrides, trimmed. A renderer that derives routes passes its own route key. `diagnoseRenderedNavigation(graph)` in `@cratis/scene.react` uses the same base `resolveDestination` builds URLs from. It includes routes derived from a screen name or module, feature and slice identity, ignores surrounding slashes, and treats `{id}` and `:id` placeholders as the same segment. A C# host passes its derivation as the `routeKey` argument.

## History, deep links and dialogs in the navigation host

`SceneNavigationHost` records every navigation as a history entry. Pass `history={createBrowserSceneHistory(window, '/app/')}` to drive the address bar; without it the host keeps an in-memory history (`createMemorySceneHistory`) for embedded and design-time hosts.

A host served as a single file or from a path it does not control - a generated runtime, a webview - passes `createHashSceneHistory(window)` instead. Entries then live in the fragment, such as `index.html#/WorkItemDetails?workItemId=B`, the page path is kept, and a fragment changed by hand is followed as well.

- **URL overrides and parameters.** A destination's `route` override, with its path and query parameters resolved from `routeParameterBindings`, is the URL written for the entry. `currentParameters` exposes the resolved values.
- **Deep links.** On start, the host matches the current URL against its routes: every screen at its own name, plus each `destinations` entry at its route override or identity route. `{name}` segments become parameters, the query string adds the rest, and literal segments win over parameters. A URL that matches nothing falls back to `initialScreen` and is reported as `unresolvedUrl`.
- **Refresh.** Each entry stores its screen, slot, parameters and open dialog, so a reload restores exactly that entry.
- **Back and forward.** The browser's buttons step through entries, and `back()` does the same from a screen.
- **Dialogs.** A dialog destination opens as its own entry over the screen that opened it. `closeDialog(result)` returns to that screen and exposes the result as `dialogResult`; the browser's back button also closes the dialog.

## Nested slots

A screen declares a nested slot with a `core:slot` element and a `name`. A destination whose `slot` names it places its screen there and keeps the declaring screen on the page. The placed screen may declare slots of its own, so composition nests to any depth. When the declaring screen is not on the page yet, as with a deep link to the innermost level, the host places it first, through the destination that opens it. Back closes the innermost level, and a destination into a slot no screen declares replaces the whole composition. The host stops after 32 levels, so a model whose screens host each other cannot loop; navigation diagnostics report such a model as `navigationCycle`.
