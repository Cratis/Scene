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
| `table` | — | `DataTable` | `DataTableForQuery` |
| `dialog` | — | `Dialog` | Arc-aware `Dialog` |
| `card` | a bordered section | a `Card` | — |

With the profile listing `core`, `PrimeReact`, `Cratis.Components` in that order, `resolveComponentName`
walks from highest priority to lowest and lands here:

```typescript
resolveComponentName('table', profile, catalog);
// { name: 'table', package: 'Cratis.Components', shadows: ['PrimeReact'] }
```

The shadowed package is **recorded, not discarded** — that list is what answers "why did this resolve to
`Cratis.Components` and not PrimeReact?" without anyone having to reason it out.

Both overrides are override priority working exactly as designed, and both are worth having:

- **`table`** — PrimeReact's `DataTable` is handed rows. `DataTableForQuery` performs the query, pages
  against the server, and wires filtering and sorting back into it. For a Cratis application that is
  strictly better, so the bare name should land on it.
- **`dialog`** — PrimeReact's `Dialog` is a modal frame. This one resolves its result through Arc's dialog
  context, so a caller awaits a `DialogResult` instead of threading `visible` state and callbacks by hand.

## `card` is deliberately *not* overridden

`@cratis/components` ships no card component. The closest thing is `Page`'s `panel` chrome, which is a page
concern rather than a card, and the `.panel` class it applies is one the consuming application defines.

Declaring `card` here would shadow `core` and PrimeReact with something worse — an override that makes the
name resolve to a weaker implementation is a regression wearing the costume of a feature. So `card` falls
through:

```typescript
resolveComponentName('card', profile, catalog);
// { name: 'card', package: 'core', shadows: [] }
```

Only override a name when you are confident the replacement is better for every screen that already writes
it. That is the test, and it is the reason two names are overridden here and a third is not.

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
- [Packages](../packages/index.md) — how a profile's package list is resolved and ordered.
