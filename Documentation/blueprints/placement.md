---
title: Placement, Opens and enablement
description: How Scene works out where an action's slice opens - from what the slice's screen fits, the slots the page has and the action's Opens - whether it can run directly, and whether the action is enabled, disabled or hidden, each with the reason an editor shows.
---

An action - a button or menu entry of an [outlet of actions](outlets.md), or the `action` component - runs a State
Change slice. Three parties decide where that slice's screen opens:

1. **The template offers** slots by role: `page`, `pane` and `panel` (see [layouts](layouts.md)). A dialog and a drawer
   are always there; they sit over the page, not in it.
2. **The slice says what it fits**, in order of preference: a screen's `fits`, such as `drawer, pane, dialog`. A slice
   with no screen fits nothing and can only run directly.
3. **The trigger picks** with `opens`. `automatic` takes the slice's first fit the page has free; the trigger names a
   place only when it wants another one.

The engine answers all of it, so Stage, Studio and the renderers agree and add no rules of their own:
`resolvePlacement` (`PlacementResolver.Resolve` in C#), `resolveEnablement` (`EnablementResolver.Resolve`), and for
an editor `inspectOutletActions` and `inspectActionElement` (`ActionInspector.InspectOutlet` and
`ActionInspector.InspectElement`).

## Fits

A `Screen` lists `fits`: `dialog`, `drawer`, `pane`, `panel` or `page`, in order. A screen that lists none fits a
dialog, where a command's form opened before screens listed what they fit. Saving a document that lists any other
value is refused (`unknownScreenFit`).

## Opens

`opens` is one model shared by an outlet's buttons and menu entries (`OutletAction`) and the `action` component, whose
descriptor offers it as *Opens* with *Slot* (`opensIn`), *Acts on* (`subject`) and *Enabled when* (`enabledWhen`).

| `opens` | Where the slice opens |
| --- | --- |
| `automatic` (default) | The screen's first fit the page has free. A slice with no screen runs directly. |
| `none` | Nowhere: the command runs directly, which needs a source for every input. |
| `dialog`, `drawer` | Over the page; the screen must list it in its fits. |
| `slot` | In the slot `opensIn` names, which the page must declare, whose role the screen must fit, and which must be free. |

A slot is free unless the page's own content fills it. A routed slot is always free, because opening something in it
replaces what it shows. Dialogs and drawers are never routed. An action that opens in a slot but names none is refused on
save (`opensSlotWithoutName`), as is an `opens` outside the five values (`unknownOpens`).

## The decision

`resolvePlacement` takes the slice, its screen and fits, the command's inputs with their sources (data context, route
value, component output or constant), the page's slots (`placementSlotsOf` builds them from a layout's or template's
slots and the slots its content fills) and the page's route values. It returns:

| Property | Meaning |
| --- | --- |
| `requested` | What the action asked for. |
| `resolved` | Where the slice opens: `none`, `dialog`, `drawer` or `slot`; absent when it cannot be placed. |
| `fit`, `slot` | The fit used, and the slot when it opens in one. |
| `routed`, `route` | Whether opening it changes the URL, and the parts it adds to the route: the slot, its route parameters with the page's values, and the slice's segment (`SetProductPrice` becomes `set-product-price`). A renderer builds the path from them. |
| `reason` | The sentence an editor shows, such as *Drawer: the slice's first fit, and the page has room*. |
| `problem` | Why it cannot open where the action asks: `noScreen`, `inputsWithoutSource`, `nothingFits`, `notFitted`, `slotNotNamed`, `slotNotDeclared`, `slotFilled` or `roleNotFitted`. |
| `runDirectly` | Whether every input has a source, the inputs that have none, and why, such as *price has no source, so it needs the form*. |
| `slots` | Every slot of the page as an *In a slot* choice: offered or not, and why, such as *Not offered: the slice doesn't list panel in what it fits*. |

## Enablement

`resolveEnablement` checks, in order, and reports every check with its outcome (`passed`, `blocked` or `unchecked`):

1. **The subject.** An action `for item` waits for a selection: *It is for item, so it waits for a selection*.
2. **Authorization.** A persona without the policy the command authorizes with does not see the action. With no
   persona given, the check is `unchecked`.
3. **`enabled when`.** The host's answer (`conditionHolds`) wins. Otherwise the condition is evaluated against the
   selected item: the structured guard condition when one is given, or else the `enabledWhen` text as written.
   `parseGuardCondition` (C#: `GuardConditionText.Parse`) reads that text. It takes comparisons of an `item.` path, an
   operator (`==`, `!=`, `>`, `>=`, `<`, `<=`, `contains`, `startsWith`) and a literal, joined with `and`/`&&` and
   `or`/`||`, in parentheses where needed. When it does not hold, the reason names the part of an `and` that fails,
   such as *Enabled when item.stock > 0, which does not hold*. Text Scene cannot read is `unchecked` (*which Scene
   cannot read*), and so is a condition with no item to evaluate it against. Scene never guesses.

A blocked authorization makes the action `hidden`, whatever else holds, because the persona never sees it. Otherwise the
first blocked check makes it `disabled`, with that check's reason; with none blocked it is `enabled`. An unchecked step
never holds an action back.

## Inspecting actions

`inspectOutletActions` takes a resolved outlet and an inspection context - the slices the actions run (screen, fits,
inputs and authorization), the page's slots and route values, whether an item is selected, the persona and the host's
`enabled when` answers - and returns, for every button and menu entry (including those in groups), its provenance in the
outlet's chain, its placement decision and its enablement. An action's subject is its own or the outlet's; its
authorization is its own or its command's. `inspectActionElement` does the same for an `action` component, whose
argument mapping gives each input its source: `component.<id>.<output>` is a component output, `route.<parameter>` a
route value, and any other path the data context.

## Upgrading stored documents

An `action` component stored with Studio's former `presentation` is upgraded by `upgradeSlotShape`
(`SlotShapeUpgrader.Upgrade`): `none` becomes `opens: none`, `modal` becomes `opens: dialog` and `drawer` becomes
`opens: drawer`. An action that stores no presentation keeps opening automatically. A presentation of another value, or
one next to an `opens` that says otherwise, is reported and kept, and saving refuses a document that still stores one
(`legacyActionPresentation`). For a Screenplay source, run `screenplay migrate --from 5 --to 6`.

The TypeScript and C# engines are asserted against the shared `placement-fixtures.json` and `slot-shape-fixtures.json`.
