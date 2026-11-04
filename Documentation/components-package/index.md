---
title: Cratis Components package
description: The Scene package that exposes @cratis/components' Arc-bound data, form and dialog composites as resolvable Scene components.
---

`Cratis.Components` is the Scene package that turns [`@cratis/components`](https://www.npmjs.com/package/@cratis/components)
— Cratis' React component library — into names a screen can resolve.

In a profile that uses PrimeReact, a `.play` document can resolve `table` to PrimeReact's `DataTable`.
That grid receives rows from its caller; the host must supply the query, paging, sorting and filtering.

When this package has priority, `table` resolves to `DataTableForQuery` instead. The screen names a query,
and the composite handles server-side paging and sends sorting and filtering to the backend. Forms,
dialogs and list pages follow the same pattern: the screen names the work, and the host supplies the
query or command class.

## What is in the box

Abstract names across seven families:

| Family | Names | What they wrap |
|---|---|---|
| Pages | `page`, `dataPage`, `formElement` | `Page`, `DataPage`, `FormElement` |
| Data | `dataTable`, `table`, `observableDataTable` | `DataTableForQuery`, `DataTableForObservableQuery` |
| Forms | `commandForm`, `queryInputForm` and twelve field types | `AutoCommandForm`, command fields, and an opt-in string-input query form |
| Dialogs | `dialog`, `confirmationDialog`, `busyIndicatorDialog`, `commandDialog`, `stepperCommandDialog` | `Dialogs` and `CommandDialog` |
| Common | `icon`, `tooltip`, `dropdown`, `errorBoundary` | `IconDisplay`, `Tooltip`, `Dropdown`, `ErrorBoundary` |
| Editors | `objectContentEditor`, `objectNavigationalBar`, `schemaEditor`, `timeMachine`, `filterPanel` | The editing and inspection surfaces |
| Toolbar | `toolbar`, `toolbarButton`, `toolbarGroup`, `toolbarSeparator` | The `Toolbar` family |

Every name, with the properties and slots it reads, is in the [component reference](components.md).

## It is a component library, and only that

The package declares `ComponentLibrary`, and its `layouts`, `screenTemplates`, `dialogTemplates` and `themes`
lists are all empty. Layout and theme selection belong to other packages:

- **No layouts or templates.** Those are decisions about what an application looks like as a whole, and they
  belong to a [blueprint](../blueprints/index.md). This package provides the Arc-bound composites a template
  is *built from*. A blueprint can place a `dataPage` in a slot and configure it without this package
  choosing the application's layout.
- **No themes.** `@cratis/components` has no palette of its own. It reads a `--cratis-*` variable layer that
  resolves the active theme's values, so an application can change its palette without replacing the
  components. See [theming through design tokens](theming.md).

## What it needs underneath it

```screenplay
ui profile Desktop
  target platform web
  target size expanded

  packages
    core
    Tailwind
    Cratis.Components
```

`@cratis/components` is built on React Aria Components, so the profile above needs no other component
library. Its styling combines a compiled Tailwind utility sheet with the `--cratis-*` token layer.
The tokens supply theme values, not the structural utility styles; the package declares Tailwind as a
dependency so those styles are available:

```typescript
dependencies: [
    { name: 'Tailwind', versionRange: '^4.0.0' },
],
```

`resolvePackageDependencies(['Cratis.Components'], catalog)` expands that to
`['Tailwind', 'Cratis.Components']`. The range is the real one: `^4.0.0` because the utility sheet is compiled
against Tailwind 4. PrimeReact is not a dependency; a profile that wants PrimeReact widgets lists the optional
`PrimeReact` package ([`@cratis/scene.primereact`](../primereact-package/index.md)) itself.

## The one thing you have to know

Most of what this library offers is **Arc-bound**. `DataPage`, both data tables, `AutoCommandForm`,
`CommandDialog` and `StepperCommandDialog` all take a *query or command class* and talk to a live backend.
A Scene element carries a `properties` bag of plain values and named slots — there is no way to put a
TypeScript class in one.

The [binding registry](binding-registry.md) is how a name in a screen becomes that class. Host integrators
should start there, then use the component reference to find the binding properties each adapter reads.
Package authors should start with Manifest authority to understand declaration ownership and host approval,
then read naming and shadowing to see how their components are selected.

## Where to go next

- [The binding registry](binding-registry.md) — how a screen names a query, and a host supplies it.
- [Query input form](query-input-form.md) — editable string arguments committed on submit, with exact optional-single binding.
- [Naming and shadowing](naming-and-shadowing.md) — why `table` resolves here and not to PrimeReact.
- [Theming through design tokens](theming.md) — how a Scene theme drives the library.
- [What this package does not cover](coverage.md) — and why each omission is deliberate.
- [Component reference](components.md) — every name, property and slot.
