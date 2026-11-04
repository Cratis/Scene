---
title: What this package does not cover
description: The parts of @cratis/components Cratis.Components deliberately does not expose, and the reasoning behind each omission.
---

The omissions below keep specialized renderers, application behavior and validation with the layer that
owns them. Each section explains what to use instead.

## `PivotViewer`

`@cratis/components/PivotViewer` is not exposed as a Scene component.

It is a canvas-rendered faceted browser built on [pixi.js](https://pixijs.com), a full WebGL rendering
engine. Declaring the name would pull that engine into the module graph of every application that lists this
package, including Studio's design-time preview even when there is no data to facet. Keeping it outside
the package lets an application choose that renderer only where it needs the faceted view.

An application that wants a pivot viewer imports it directly and places it in a slot. The application then
owns the specialized renderer and the data it needs.

## `card`

`@cratis/components` ships no card. See [naming and shadowing](naming-and-shadowing.md) — overriding a name
with a weaker implementation is a regression, so `card` falls through to `core` or PrimeReact.

## Table columns

`dataTable` and `dataPage` take their columns from the `content` slot, and this package declares no `column`
name.

When the composition uses PrimeReact columns, its `Column` is a configuration element rather than a
rendered one and comes from the PrimeReact package. This package does not declare another `column` merely
to duplicate it. Choose the column configuration supported by the renderer in use. This package does
not require PrimeReact for every table or guarantee that another renderer accepts the same configuration.

## Event handlers

A screen configures a component through `properties` and fills it through `slots`. There is no seam yet for
binding a click to an action, so adapters do not expose `onClick`, `onSelectionChange` or `onNavigate`.

Callbacks that change only the component's *own* visible state remain local to the adapter: clicking a
breadcrumb truncates the trail, the schema editor accepts edits, and the time machine scrubs. That preview
state is not an application action or a persisted model change. A host that needs the result reads it from
its own model.

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
given an invented epoch timestamp would appear in the wrong position among the real entries. Dropping
an incomplete entry leaves the list visibly short without presenting a fabricated history.

## Where to go next

- [Component reference](components.md) — everything that *is* covered.
- [The binding registry](binding-registry.md) — the one constraint that shapes the rest of the package.
