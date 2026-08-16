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
