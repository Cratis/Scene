---
title: What this package does not cover
description: The parts of @cratis/components Cratis.Components deliberately does not expose, and the reasoning behind each omission.
---

Every omission below is a decision. None of them is "not done yet".

## `PivotViewer`

`@cratis/components/PivotViewer` is not exposed as a Scene component.

It is a canvas-rendered faceted browser built on [pixi.js](https://pixijs.com), a full WebGL rendering
engine. Declaring the name would pull that engine into the module graph of every application that lists this
package — including Studio's design-time preview, where a canvas of animated tiles has nothing to show
because there is no data to facet. The cost is a heavy renderer in every bundle; the benefit at design time
is zero.

An application that wants a pivot viewer imports it directly and places it in a slot. That is the right shape
for a component this specialized: it is a destination, not a building block.

## `card`

`@cratis/components` ships no card. See [naming and shadowing](naming-and-shadowing.md) — overriding a name
with a weaker implementation is a regression, so `card` falls through to `core` or PrimeReact.

## Table columns

`dataTable` and `dataPage` take their columns from the `content` slot, and this package declares no `column`
name.

A PrimeReact `Column` is a configuration element rather than a rendered one, and it belongs to the PrimeReact
package. Declaring a second, identical `column` here would create a shadow with nothing behind it — priority
resolution doing work for no reason.

## Event handlers

A screen configures a component through `properties` and fills it through `slots`. There is no seam yet for
binding a click to an action, so adapters do not expose `onClick`, `onSelectionChange` or `onNavigate`.

Where a component's callback drives its *own* visible state, the adapter holds that state so the component
behaves like the component it is — the breadcrumb trail truncates when you click a crumb, the schema editor
accepts edits, the time machine scrubs. That state is local to the preview. A host that needs the result
reads it off its own model.

Where a callback would reach outside the component — navigating, executing something — the adapter exposes
nothing rather than a handler that quietly does nothing.

## Date ranges on `calendarField`

`minDate` and `maxDate` are not exposed. They would arrive from the property bag as strings and have to be
parsed here, and a bound range that silently misparses is worse than no bound range at all. A date range that
has to be enforced belongs in the command's validator, where it is authoritative for every caller rather than
only for this one field.

## Rich content in `timeMachine` versions

A version's `content` is rendered as text. A version whose content is a whole element tree is not something a
property bag can carry, and pretending otherwise would be the wrong seam — that belongs in a
[screen template](../blueprints/screen-templates.md).

Entries missing an `id`, a `label` or a parseable `timestamp` are dropped rather than defaulted. A version
invented at the epoch would not be a slightly wrong entry; it would silently reorder every real one around
it. A dropped entry is visibly one item short, and a fabricated one is a timeline that lies.

## Where to go next

- [Component reference](components.md) — everything that *is* covered.
- [The binding registry](binding-registry.md) — the one constraint that shapes the rest of the package.
