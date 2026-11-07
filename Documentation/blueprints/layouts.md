---
title: Layouts
description: An application's base navigational shell - its slots, how they are arranged, and how a layout differs from a screen template.
---

A layout is an application's base navigational look: the shell everything else renders inside.

```csharp
public record Layout(string Name, IReadOnlyList<Slot> Slots, Arrangement? Arrangement = null);
```

Three things, and the third is optional. `Slots` are the named regions the shell offers — a top bar, a
navigation area, a content region, a footer. `Arrangement` says how those slots sit relative to each other.
With no arrangement, they are simply in declaration order.

An application has **one** layout in force, and selects it — usually from a [blueprint](index.md).

## Slots

```csharp
public record Slot(string Name, Arrangement? Arrangement = null);
```

A slot's own `Arrangement` is a different thing from the layout's, and the distinction matters:

- The **layout's** arrangement positions the slots relative to each other. Its flow leaves are
  `FlowSlotLeaf`, which reference a slot by name.
- A **slot's** arrangement positions the content filling that one slot. Its flow leaves are `FlowLeaf`, which
  carry a real element.

A layout is not uniformly one arrangement mode. Flow for most slots and freeform for one is a valid
combination, and the engine evaluates each independently.

### What a slot is

A slot also says what kind of region it is. Screen templates declare their slots the same way.

| Member | Meaning |
| --- | --- |
| `Role` | `page`, `pane` or `panel`. Leave it out and the slot is a `page` when it is primary and a `pane` otherwise. Read it through `resolveSlotRole` (C#: `SlotRoles.Resolve`), which applies that default. |
| `Routed` | Navigation replaces the slot's content, so the slot is a destination. A slot that is not routed is filled by composition only. |
| `RoutedBy` | The route parameters a routed slot is addressed by, Screenplay's `routed by <param>`. Route parameters on a slot that is not routed are an error. |
| `Primary` | The slot every screen's content goes into when nothing names another. A layout or template has at most one. The shell's primary slot is `content` when no slot is marked. Read it through `primarySlotOf` (C#: `SlotRoles.PrimaryOf`). |
| `Optional` | The slot may stay empty, and takes no space when it does. |
| `Accepts` | The template types (`TemplateMetadata.type`) a screen must have to be placed in the slot, for example `Detail`. Leave it out to accept any screen. |
| `Description` | A description for designers. |

In Screenplay, `content page routed primary` is a primary routed page, and `detail pane routed by sku optional`
is an optional detail pane addressed by `sku`.

A routed slot is placed by the `core:slot` element its content declares, not by the arrangement, so the
arrangement does not have to position it. Destinations name a routed slot by its `name`, and routed slot
names are unique across the application (`duplicateSlot`).

### Documents written before Scene 5

Before Scene 5 a layout or template listed its routed regions separately as `outlets`, a shell named its
primary region in `metadata.primaryOutlet`, a destination named an `outlet` with `kind: outlet`, and a screen
declared a nested region with `core:outlet`. Scene 5 removes all of these without a deprecation period.

- `upgradeSlotShape(document)` (C#: `SlotShapeUpgrader.Upgrade`) reads a stored document in the old shape
  and returns it in the slot shape. It accepts a whole document, a template library, or a single layout,
  template or destination. Each outlet becomes a slot with `routed: true`, merged into a slot of the same name
  if there is one. `primaryOutlet` becomes `primary: true` on the slot it names. A destination's `outlet` and
  kind become `slot`, and `core:outlet` becomes `core:slot`. Running it on a document that is already in the
  slot shape changes nothing. Anything it cannot map stays where it was and is listed in `diagnostics`.
  It never overwrites or destroys a value the user set. A slot that already has a `description`, `routed`
  (even `false`) or `accepts` keeps it, and a `null` on the outlet is never copied. `kind: outlet` is renamed
  only on a destination. Inside an element's `properties`, the values a user typed, only destinations are
  upgraded, so a property value that happens to look like an old outlet list or toolbar stays as it is. The
  validator skips those values the same way.
- `validateSlotShape(document)` (C#: `SlotShapeValidator.Validate`) lists anything left of the old shape
  (`legacyOutletShape`) and any broken slot rule. Saving a document through
  `SceneDocumentChangeValidation.Validate` refuses it with `invalidSlotShape` until the document is upgraded.
  The stored document it is compared with, and the stored documents it inherits from, are upgraded first, so
  saving an upgraded document over one stored in the old shape is judged on what actually changed.
  The message names the upgrade and `screenplay migrate --from 5 --to 6`.

The shared `slot-shape-fixtures.json` corpus holds both engines to the same results.

## Arrangement

Two modes, both evaluated by `Cratis.Scene.Engine.Layouts` and its TypeScript twin.

**Flow** is a tree of rows, columns and grids, with size-class overrides:

```csharp
new FlowArrangement(
    Root: new FlowColumn
    {
        Children =
        [
            new FlowSlotLeaf("topbar"),
            new FlowRow { Children = [new FlowSlotLeaf("sidebar"), new FlowSlotLeaf("content") { Grow = 1 }] },
            new FlowSlotLeaf("footer")
        ]
    },
    Overrides:
    [
        new FlowOverride(
            Width: WidthSizeClass.Compact,
            Height: null,
            Root: new FlowColumn { Children = [new FlowSlotLeaf("topbar"), new FlowSlotLeaf("content"), new FlowSlotLeaf("footer")] })
    ]);
```

The override drops the sidebar out of the flow on a compact width. `Width` and `Height` are independently
nullable, so an override can key on either axis or both. When more than one override matches a concrete size
class, the most specific wins — both dimensions beats one — and among equally specific matches, the last
declared wins.

**Freeform** is one variant per size-class combination, each placing slots at explicit coordinates. Selection
is exact-match only: a size class with no matching variant returns nothing rather than falling back to a
variant that was never designed for it. That is deliberate — "warn, don't silently pick".

## Size classes

Size classes are named, not pixel breakpoints: `Compact` or `Regular` on each of width and height. A narrow
browser window and a phone in portrait are the *same* class, which is what lets one layout describe both.

`SizeClassCalculator.Compute` (C#) and `computeSizeClass` (TypeScript) own the conversion from a real size,
with a 600dip default breakpoint per axis. It lives in the engine, shared by every renderer, so a React
renderer and a future native one agree exactly on when a boundary is crossed.

## Layouts and screen templates

A [screen template](screen-templates.md) has the same shape — slots plus an arrangement — and is evaluated by
the same engine. The difference is role and one field: a screen template also declares which of its parent's
slots it fills, and an application has many of them, where it has one layout.

A UI profile names its shell with a [root template](root-template.md): an own or blueprint template reference with a version pin
and the shell's options. The profile's `layout` name stays readable as the legacy form. Which shell an application ends up with is answered
by `resolveEffectiveShell` alone; the shell's slots are what screens place content in, and the primary one (`content` unless a slot is marked `primary`) receives every screen's content.
