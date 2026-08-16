---
title: Use the Components blueprint
description: Activate the blueprint, boot one of its pages through the real engine, and register the query behind it.
---

Let's take an Arc-bound page from "nothing" to "showing real invoices". Three steps: list the package,
render a screen, register the query.

## List it in your profile

A blueprint is a packaged artifact, not a language construct — it never appears in a `.play` file. A
`ui profile` lists it by name, exactly like a component library:

```screenplay
ui profile Desktop
  target platform web
  target size expanded

  packages
    core
    Tailwind
    PrimeReact
    Cratis.Components
    Cratis.Blueprint.Default
    Cratis.Blueprint.Components
```

Declaration order is ascending override priority, and this order is the one the package itself resolves
against:

```typescript
export const componentsBlueprintProfile: UiProfile = {
    name: 'Arc pages',
    targetPlatform: 'web',
    packages: ['core', 'PrimeReact', cratisComponentsPackageManifest.name, defaultBlueprintName, componentsBlueprintName],
};
```

`Cratis.Components` sits above `PrimeReact`, so a template naming `table` or `dialog` gets the Arc-aware
one and PrimeReact's is recorded as shadowed rather than discarded. Both blueprints sit above both
libraries, so `pageHeader` and `arcPageHeader` resolve to the packages that declare them.

You do not have to write all six by hand. Declaring only the blueprint and letting the resolver expand it
gives you the same list, in a valid order:

```typescript
const selection = resolvePackageDependencies(['Cratis.Blueprint.Components'], catalog);
isPackageSelectionValid(selection).should.be.true;
```

If a dependency is missing from the catalog, you get told which one while the profile is being configured,
rather than finding out when the page opens.

## Render a page

The package ships a `Screen` per template, so a host can boot one through the real engine with nothing else
in place:

```tsx
import { GalleryScreenPreview } from '@cratis/scene.blueprint.components';

<GalleryScreenPreview screenName='DataListPage' />
```

Nothing about that path is preview-only. The screen is a real `Screen`, its bare component names go
through the real `resolveComponentName`, and it is rendered by the real `SceneElementView` against the real
merged registry — the same path a shipped application takes.

What you see is a complete application shell — topbar, sidebar, breadcrumb, footer, the configurator — with
an invoice page inside it. The header reads:

```text
Billing › Invoices
Invoices
Every invoice, filterable and paged against the server
No query registered as AllInvoices
```

…and where the table should be:

```text
Unresolved query binding 'AllInvoices' on Cratis.Components:dataPage
```

That last line is not an error to fix before continuing. It is the design-time state: the template carries
a query *name*, and nothing has supplied the class behind it yet.

## Register the query

Only a host owns the generated Arc proxies, so only a host can close that gap. It registers every proxy a
screen can name, once, at startup:

```typescript
import { registerQueries, registerCommands } from '@cratis/scene.components';
import { AllInvoices, InvoiceById, InvoicesInFlight } from './Billing/proxies';
import { RegisterInvoice, RecordAdjustment } from './Billing/commands';

registerQueries({ AllInvoices, InvoiceById, InvoicesInFlight });
registerCommands({ RegisterInvoice, RecordAdjustment });
```

Render the same screen again and two things change. The header now reads `Bound to query AllInvoices`, and
the placeholder is gone — the `dataPage` has its class, performs the query, and pages against your backend.

Object shorthand is the point of the bulk form: Stage generates a module exporting every proxy it produced,
and handing that module's exports straight in stays correct as proxies are added and removed without anyone
editing a list. [Wiring the binding registry](wiring-the-binding-registry.md) covers which names this
blueprint's templates ask for.

## Point a template at your own query

The shipped names are defaults, not fixtures. A template ships bound to something so that it renders as a
*page* rather than a diagram of one; an application replaces the name and nothing else about the template
changes:

```typescript
const invoiceList: ScreenTemplate = {
    ...dataListPageTemplate,
    name: 'PurchaseOrderList',
    content: {
        [TemplateSlotName.Header]: [arcPageHeader('po-header', { title: 'Purchase orders', section: 'Procurement', query: 'AllPurchaseOrders' })],
        [TemplateSlotName.Body]: [dataPage('po-body', 'AllPurchaseOrders', purchaseOrderTableOptions, purchaseOrderColumns)],
    },
};
```

At that point you are writing templates, not screens — which is the moment to read
[add a template of your own](add-a-template.md).

## Where to go next

- [Wire the binding registry](wiring-the-binding-registry.md) — every name these templates ask for.
- [The template catalogue](template-catalogue.md) — the other ten screen templates and the three dialogs.
- [Add a template of your own](add-a-template.md) — the two rules that keep a new template composable.
