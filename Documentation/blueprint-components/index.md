---
title: Cratis Components blueprint
description: A blueprint of Arc-bound screen and dialog templates - whole pages built from the Cratis Components composites, for the default blueprint's shell.
---

You have picked the [default blueprint](../blueprints/index.md), so your application has a shell: a topbar, a
sidebar with eight menu modes, a breadcrumb, a content region and two themes. You have listed
[`Cratis.Components`](../components-package/index.md), so a screen can name `dataPage` and get a real
list screen instead of a table it has to feed by hand.

And then you build your first list page, and you make seven decisions: which query, which columns, what the
empty message says, which property identifies a row, which fields the search box filters across, what the
header says and where its actions go. Then you build the second one, and you make those seven decisions
again — slightly differently, because it is a week later. By the tenth page an application has ten list
screens that are almost the same, and the differences are all accidents.

`Cratis.Blueprint.Components` is the answer to that. It ships those decisions already made, as templates:

```typescript
export const dataListPageTemplate: ScreenTemplate = {
    name: 'DataListPage',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Body }],
    content: {
        [TemplateSlotName.Header]: [arcPageHeader('data-list-header', { title: 'Invoices', section: 'Billing', query: SampleBindingName.AllInvoices })],
        [TemplateSlotName.Body]: [dataPage('data-list-body', SampleBindingName.AllInvoices, invoiceTableOptions, invoiceColumns)],
    },
};
```

You pick the template and supply a query name. The page is done.

## What is in the box

Eleven screen templates and three dialog templates. Every one of them is a whole page or a whole dialog,
not a fragment.

| Template | What it is |
|---|---|
| `DataListPage` | A `dataPage` bound to one query, under a header stating the binding |
| `ObservableDataListPage` | The live variant, over an observable query |
| `DataListWithDetailPage` | The list, with the selected record's document and history beside it |
| `MasterDetailPage` | A queried list in the larger column, the record in the narrower one |
| `DashboardPage` | Four query-backed widgets, arranged the way people read a dashboard |
| `CommandFormPage` | A generated command form with its own action bar |
| `SchemaEditorPage` | An event type's schema, edited as a typed property tree |
| `ObjectEditorPage` | One document against its schema, with its trail and version history |
| `DataModulePage` · `DataFeatureSection` · `CommandSliceSection` | A worked three-level nesting chain |
| `CommandDialog` · `ConfirmDialog` · `BusyDialog` | The three dialog shapes an Arc application repeats |

Every one is in [the template catalogue](template-catalogue.md), with the slots it declares and the
bindings it names.

## How it differs from the default blueprint

They are both blueprints, and they do opposite halves of the job.

The default blueprint answers **"what does this application look like"**. It ships two layouts, sixteen
shell components, twenty-three screen templates and two themes, and its templates are built from
primitives — a `dataTable` handed rows, a form of `inputText` fields, a dialog assembled from a title, a
message and two buttons. Those templates are about *shape*. They render fully with no backend at all,
because there is no backend in them.

This blueprint answers **"what does a page look like once it is bound to Arc"**. Its templates are built
from the Cratis Components composites, so a list page performs a real query, pages against the server, and
wires filtering and sorting back into it. They are about *behavior*, and the price of that is that most of a
page is a placeholder until a host registers the bindings — which is the normal design-time state and not a
shortcoming.

| | Default blueprint | This blueprint |
|---|---|---|
| Layouts | Two application shells | **None** — it reuses the default's |
| Themes | Two | **None** — it reuses the default's |
| Templates built from | `core` and PrimeReact primitives | `Cratis.Components` Arc-bound composites |
| Renders without a backend | Completely | Headers and editors do; queried regions are placeholders |
| Components registered | Sixteen shell components | **One** |

That "none" and that "one" are the design, not an unfinished list — see
[layering on another blueprint](layering-on-a-blueprint.md) for why an empty `layouts` is the whole point,
and [the template catalogue](template-catalogue.md) for the one component that earned its place.

## What it needs underneath it

```typescript
dependencies: [{ name: 'Cratis.Blueprint.Default' }, { name: 'Cratis.Components' }],
```

This is the first blueprint in Scene that depends on another blueprint. `resolvePackageDependencies`
expands that declaration transitively, so listing this package in a profile pulls in the default blueprint,
Cratis Components, and everything those two need in turn:

```typescript
const selection = resolvePackageDependencies(['Cratis.Blueprint.Components'], catalog);
// selection.added contains 'PrimeReact' and 'Tailwind'
// 'Cratis.Blueprint.Default' and 'Cratis.Components' both come before 'Cratis.Blueprint.Components'
```

The ordering is not incidental. Declaration order in a profile is ascending override priority, so this
package outranking both means a template of its own can shadow one of the default blueprint's if it ever
needs to — and `Cratis.Components` outranking `PrimeReact` is what makes a template naming `table` resolve
to the Arc-aware one.

## Where to go next

- [Use the Components blueprint](getting-started.md) — activate it, render a page, register a binding.
- [Wire the binding registry](wiring-the-binding-registry.md) — what a host has to supply, and what happens
  before it does.
- [Add a template of your own](add-a-template.md) — the recipe, and the two rules that keep it composable.
- [Layering on another blueprint](layering-on-a-blueprint.md) — why `layouts` is empty and what that buys.
- [The template catalogue](template-catalogue.md) — every template, slot and binding.
