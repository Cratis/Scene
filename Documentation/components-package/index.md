---
title: Cratis Components package
description: The Scene package that exposes @cratis/components' Arc-bound data, form and dialog composites as resolvable Scene components.
---

`Cratis.Components` is the Scene package that turns [`@cratis/components`](https://www.npmjs.com/package/@cratis/components)
— Cratis' React component library — into names a screen can resolve.

Without it, a `.play` document that says "show a table of invoices" resolves `table` to PrimeReact's
`DataTable`: a grid that renders rows it is handed, and knows nothing about where they came from. You still
have to write the query, the paging, the sorting and the filtering by hand, in code the screen cannot see.

With it, `table` resolves to `DataTableForQuery`, and the screen names a query instead. The paging is
server-side, the sorting and filtering go back to the backend, and the whole thing is one element in the
model. The same swap happens for the form, the dialog, and the whole list page — that is the relief this
package delivers.

## What is in the box

Thirty-seven abstract names across seven families:

| Family | Names | What they wrap |
|---|---|---|
| Pages | `page`, `dataPage`, `formElement` | `Page`, `DataPage`, `FormElement` |
| Data | `dataTable`, `table`, `observableDataTable` | `DataTableForQuery`, `DataTableForObservableQuery` |
| Forms | `commandForm` and twelve field types | `AutoCommandForm` and the `CommandForm` fields |
| Dialogs | `dialog`, `confirmationDialog`, `busyIndicatorDialog`, `commandDialog`, `stepperCommandDialog` | `Dialogs` and `CommandDialog` |
| Common | `icon`, `tooltip`, `dropdown`, `errorBoundary` | `IconDisplay`, `Tooltip`, `Dropdown`, `ErrorBoundary` |
| Editors | `objectContentEditor`, `objectNavigationalBar`, `schemaEditor`, `timeMachine`, `filterPanel` | The editing and inspection surfaces |
| Toolbar | `toolbar`, `toolbarButton`, `toolbarGroup`, `toolbarSeparator` | The `Toolbar` family |

Every name, with the properties and slots it reads, is in the [component reference](components.md).

## It is a component library, and only that

The package declares `ComponentLibrary`, and its `layouts`, `screenTemplates`, `dialogTemplates` and `themes`
lists are all empty. That is a statement, not an oversight:

- **No layouts or templates.** Those are decisions about what an application looks like as a whole, and they
  belong to a [blueprint](../blueprints/index.md). This package provides the Arc-bound composites a template
  is *built from* — so a blueprint can place a `dataPage` in a slot and configure it, rather than this
  package shipping one opinionated data page nobody can rearrange.
- **No themes.** `@cratis/components` has no palette of its own. It reads a `--cratis-*` variable layer that
  resolves whatever theme is active underneath it. Shipping a theme here would be this library asserting a
  look it was specifically built not to have. See [theming through design tokens](theming.md).

## What it needs underneath it

```screenplay
ui profile Desktop
  target platform web
  target size expanded

  packages
    core
    Tailwind
    PrimeReact
    Cratis.Components
```

Every component in `@cratis/components` is a wrapper over a PrimeReact widget, and its styling is a compiled
Tailwind utility sheet plus the `--cratis-*` token layer. List it without PrimeReact and nothing renders;
list it without Tailwind and everything renders unstyled. So it declares both:

```typescript
dependencies: [
    { name: 'PrimeReact', versionRange: '>=10.9.0' },
    { name: 'Tailwind', versionRange: '^4.0.0' },
],
```

`resolvePackageDependencies(['Cratis.Components'], catalog)` expands that to
`['Tailwind', 'PrimeReact', 'Cratis.Components']` — which is also the correct override priority, since this
package layers on both. The version ranges are the real ones: `>=10.9.0` because the `--cratis-*` tokens
resolve PrimeReact 11's design tokens first and fall back to version 10's theme variables, and `^4.0.0`
because the utility sheet is compiled against Tailwind 4.

## The one thing you have to know

Most of what this library offers is **Arc-bound**. `DataPage`, both data tables, `AutoCommandForm`,
`CommandDialog` and `StepperCommandDialog` all take a *query or command class* and talk to a live backend.
A Scene element carries a `properties` bag of plain values and named slots — there is no way to put a
TypeScript class in one.

The [binding registry](binding-registry.md) is how a name in a screen becomes that class. Read that page
before you build anything on this package; everything else here assumes it.

## Where to go next

- [The binding registry](binding-registry.md) — how a screen names a query, and a host supplies it.
- [Naming and shadowing](naming-and-shadowing.md) — why `table` resolves here and not to PrimeReact.
- [Theming through design tokens](theming.md) — how a Scene theme drives the library.
- [What this package does not cover](coverage.md) — and why each omission is deliberate.
- [Component reference](components.md) — every name, property and slot.
