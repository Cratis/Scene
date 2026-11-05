---
title: Naming and shadowing
description: How Cratis Components names its components, and why table and dialog deliberately override the packages underneath it.
---

A screen writes `table`. Which `table` it gets is decided by the profile's package list, not by the screen —
and that is the whole reason component names are abstract.

## The naming rules

- **`lowerCamelCase`, always.** `dataTable`, `inputTextField`, `stepperCommandDialog`.
- **Abstract, not the wrapped type's name.** The name is `dataTable`, not `DataTableForQuery`. A screen that
  named the implementation would be pinned to this package; a screen that names the concept resolves against
  whichever package the profile ranks highest.
- **Registered as `Cratis.Components:<name>`.** The key carries its package, so nothing collides across
  packages and merge order never matters.

A screen can also qualify a name explicitly — `Cratis.Components.table` — which resolves directly against
that package and bypasses priority entirely. An author naming the package has already disambiguated.

## Two names are deliberate overrides

Three packages in a typical profile declare `table`, and two declare `dialog`:

| Name | `core` | `PrimeReact` | `Cratis.Components` |
|---|---|---|---|
| `table` | `CoreTable` | `DataTable` | `DataTableForQuery` |
| `dialog` | — | `Dialog` | Arc-aware `Dialog` |
| `card` | a bordered section | a `Card` | — |

With the profile listing `core`, `PrimeReact`, `Cratis.Components` in that order, `resolveComponentName`
searches from last to first. The last package declaring the name wins:

```typescript
resolveComponentName('table', profile, catalog);
// { name: 'table', package: 'Cratis.Components', shadows: ['PrimeReact', 'core'] }
```

Both earlier table declarations are **recorded, not discarded**. The shadow list explains why the name
resolved to `Cratis.Components` rather than PrimeReact or core.

The overrides select different behavior, not just different styling:

- **`table`** — PrimeReact's `DataTable` receives rows from its caller. `DataTableForQuery` performs the
  query, pages against the server, and wires filtering and sorting back into it. Ranking this package
  higher lets a screen request that query-bound behavior through the existing name.
- **`dialog`** — PrimeReact's `Dialog` is a modal frame. This one resolves its result through Arc's dialog
  context, so a caller awaits a `DialogResult` instead of threading `visible` state and callbacks by hand.

## `card` is deliberately *not* overridden

`@cratis/components` ships no card component. The closest thing is `Page`'s `panel` chrome, which is a page
concern rather than a card, and the `.panel` class it applies is one the consuming application defines.

Declaring `card` here would shadow `core` and PrimeReact without supplying a comparable card component.
Leaving it undeclared preserves those implementations. In the profile above, `card` falls through to
PrimeReact, which has priority over core:

```typescript
resolveComponentName('card', profile, catalog);
// { name: 'card', package: 'PrimeReact', shadows: ['core'] }
```

An override changes the implementation for screens that already use the name. Check that the replacement
supports their intended behavior before declaring it; omitting an override leaves the existing choice
available.

## `dataTable` and `table` are the same component

`dataTable` says what it is. `table` is what a screen written against the base vocabulary already says. Both
resolve to the same adapter, so adopting this package does not require rewriting screens, and a screen that
wants to be explicit can be.

## The declaration and the bundle must agree

A manifest that promises a component the bundle does not register renders as an `UnresolvedComponent` at
runtime — a blank box, far from the mistake. A component registered but not declared can never be named by a
screen at all. Both are silent failures, which is why every package runs:

```typescript
validatePackageBundle(cratisComponentsPackage).should.deep.equal([]);
```

## Where to go next

- [Component reference](components.md) — the full name list.
- [Frontend package hosting](../package-hosting.md) — how a host approves packages and resolves a profile's packages and dependencies.
