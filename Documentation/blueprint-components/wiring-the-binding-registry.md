---
title: Wire the binding registry
description: Which query and command names this blueprint's templates ask for, how a host supplies them, and what a page looks like before it does.
---

Every Arc-bound region on these pages is waiting on one thing: a class. The template carries a *name*, and
a host registers the generated Arc proxy under it. This page is the recipe for the host's side.

The mechanism itself belongs to `Cratis.Components` and is explained once, in
[the binding registry](../components-package/binding-registry.md). Read that first if you have not — it
covers why a name is the only thing that survives the trip from a `.play` document to a renderer. What
follows assumes it.

## Register at startup

```typescript
import { registerQueries, registerCommands } from '@cratis/scene.components';
import * as queries from './Billing/queries';
import * as commands from './Billing/commands';

registerQueries(queries);
registerCommands(commands);
```

Do it once, at your entry point, before the first screen renders. Registering the same name twice replaces
the earlier registration, so a host can re-register on hot reload without unwinding the previous run.

## The names these templates ask for

The shipped templates are bound to an invoice model, so that the whole package reads as one small
application rather than eleven unrelated demonstrations. These are the names they write:

| Name | Kind | Which templates want it |
|---|---|---|
| `AllInvoices` | Query | `DataListPage`, `DataListWithDetailPage`, `MasterDetailPage`, `DashboardPage` |
| `InvoicesInFlight` | Observable query | `ObservableDataListPage`, `DashboardPage`, `DataFeatureSection` |
| `InvoiceById` | Query | `ObjectEditorPage` |
| `RevenueByMonth` | Query | `DashboardPage` |
| `OpenTickets` | Query | `DashboardPage` |
| `AllAdjustments` | Query | `DashboardPage` |
| `RegisterInvoice` | Command | `CommandFormPage` |
| `RecordAdjustment` | Command | `CommandSliceSection`, `CommandDialog` |

They are exported as an enum, so a host can register against the symbols rather than retyping strings:

```typescript
import { SampleBindingName } from '@cratis/scene.blueprint.components';

registerQueries({ [SampleBindingName.AllInvoices]: AllInvoices });
```

`InvoicesInFlight` is the one to look at twice. It is named by `observableDataTable` rather than
`dataTable`, and the difference lives in the proxy you register, not in how the element is configured: an
observable query opens a subscription and the page re-renders when the read model changes on the server.
Registering a plain query under that name will render, and will not be live.

## What a page looks like before you register

Three states, three different problems, three different fixes. Every page in this blueprint opens with an
`arcPageHeader`, and it tells you which one you are in:

| The header says | What it means | What to do |
|---|---|---|
| `Bound to query AllInvoices` | A host registered a class under that name | Nothing |
| `No query registered as AllInvoices` | The template named it; nothing is registered | Register it, or fix the name |
| `No binding` | The template named nothing, deliberately | Nothing — see below |

The third is not a defect. `SchemaEditorPage` genuinely has no query behind it: a schema is design-time
metadata about an event type, not a read model anyone queries, so its header says so rather than implying
a wiring step that does not exist.

Below the header, an unbound region names what it wanted:

```text
Unresolved query binding 'AllInvoices' on Cratis.Components:dataPage
```

A template that named nothing at all reads differently, because it is a different mistake:

```text
Missing query binding on Cratis.Components:dataPage
```

The first needs the host to register that name; the second needs the template edited.

## Half of a page renders anyway

Not everything on these pages is Arc-bound, and the split is worth knowing because it decides what design
work you can do before a backend exists.

**Waiting on a binding:** `dataPage`, `dataTable`, `observableDataTable`, `commandForm`, `commandDialog`.

**Not waiting on anything:** `schemaEditor`, `objectContentEditor`, `objectNavigationalBar`, `timeMachine`,
`filterPanel`, `toolbar` and the page chrome. These read their content out of the property bag, so they
render fully with no host at all.

That is why `SchemaEditorPage` and `ObjectEditorPage` are the two pages to open first when looking at this
blueprint — they are complete without a backend. It is also why one unbound table costs one dashed box
rather than the page: a design surface stays usable while the wiring is still missing, which is the whole
reason a missing binding is a placeholder and never a throw.

## The Arc runtime is the host's, too

`@cratis/arc` and `@cratis/arc.react` are peer dependencies of `@cratis/components` that the host supplies,
and a design surface is not a host. Every Arc-bound adapter therefore reaches them through a dynamic
`import()`. A page built only from the Arc-free composites never pulls the Arc client in at all, and an
unbound table never even reaches the import.

When a binding *is* registered and the client is not installed, the chunk fails to load and the
`ArcRuntimeBoundary` around it shows the library's own error boundary — one dashed-out region, not a blank
screen. That is exactly what this package's Storybook shows in its `Bound` story, and it is honest rather
than hidden: it is what a real host without Arc installed sees.

## Where to go next

- [The binding registry](../components-package/binding-registry.md) — the mechanism, in full.
- [The template catalogue](template-catalogue.md) — which composite sits in which slot of which template.
- [Add a template of your own](add-a-template.md) — how to carry a binding name in a template you write.
