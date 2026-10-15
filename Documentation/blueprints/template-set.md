---
title: The template set
description: Every screen template and dialog template the default blueprint ships, what each is for, and which layout it renders in.
---

The default blueprint ships thirty-six screen templates (the eight [foundation templates](./foundation-templates.md), the four [auth and state screens](./foundation-templates.md#auth-and-state-screens) and twenty-four earlier ones) and seven dialog templates (the three earlier ones and the four [foundation dialogs](./foundation-templates.md#dialogs)). Each screen template
has a matching `Screen` in the gallery, so every row below is something you can boot and look at.

## The foundation set

`WorkspaceScreen`, `DashboardScreen`, `ListScreen`, `BoardScreen`, `MasterDetailScreen`, `RecordPage`, `FormScreen` and `WizardScreen` are the templates a new blueprint starts from. They are described, with their slots, states and responsive rules, in [foundation screen templates](./foundation-templates.md). The earlier templates below keep their names.

## In the application shell

Eleven shapes, each fitting the `AppShell` layout's `content` slot.

| Template | For | Its own slots |
| --- | --- | --- |
| `Dashboard` | Four stat cards over two columns of widgets | `stats`, `primary`, `secondary` |
| `CrudList` | A searchable table with a header and a primary action | `toolbar`, `body` |
| `MasterDetail` | A list beside the selected record, with a `master-detail.detail` outlet that accepts `Detail` screens | `header`, `primary`, `sidePanel` |
| `DetailView` | One record: header with actions, its sections, a summary panel | `header`, `body`, `sidePanel` |
| `FormPage` | A grouped form with the field types applications actually use | `header`, `body`, `actions` |
| `Empty` | The designed empty state for a list with nothing in it | `body` |
| `Documentation` | Prose with a table of contents beside it | `sidePanel`, `body` |
| `ProfileSettings` | The signed-in user editing their own account | `header`, `body`, `actions` |
| `UserManagement` | The people table, with roles and an invitation action | `toolbar`, `body` |
| `Invoice` | A printable document: parties, line items, totals | `header`, `body`, `actions` |
| `Help` | Searchable answers with a route to a human | `header`, `body`, `sidePanel` |

`Dashboard` follows Sakai's composition - a row of four figures, then two columns of larger widgets - and
carries its own arrangement that collapses the two columns into one at a compact width. `MasterDetail` does
the same with its list and record: side by side at a regular width, stacked at a compact one.

The last five are in the set because leaving them out is what makes a template line feel thin. Every real
application grows documentation, settings, user administration, a printable document and a help page, and
the ones nobody designed are the ones that end up looking like a different product.

## In the full-page shell

Ten chrome-less shapes, each fitting the `FullPage` layout's `content` slot and filling its `aside`.

| Template | For |
| --- | --- |
| `Login` | Email and password beside the branding panel |
| `Register` | Account creation, with a strength meter and the terms checkbox |
| `ForgotPassword` | One field and one button - the point is that it asks for nothing else |
| `NewPassword` | Where a reset link lands: choose it, confirm it, done |
| `Verification` | The code step, with the progress indicator |
| `LockScreen` | One person, one password, and no way to lose what was open |
| `Error` | A server-side failure, said plainly, with a way onward |
| `AccessDenied` | A refusal that distinguishes "not signed in" from "not allowed" |
| `NotFound` | A wrong address, with a search box rather than a dead end |
| `Landing` | The marketing front door, with navigation of its own |

The four that are nobody's plan - `Error`, `AccessDenied`, `NotFound`, `Landing` - matter more than their
frequency suggests. An error page is the screen most likely to be someone's first impression of how
carefully an application was built.

## The nesting chain

Three templates that exist to demonstrate, and to be asserted, rather than to be used as-is.

| Template | `fitsSlot` | Fits into | Offers |
| --- | --- | --- | --- |
| `ModuleWorkspace` | `content` | the `AppShell` layout | `header`, `body`, `sidePanel` |
| `FeatureSection` | `body` | `ModuleWorkspace` | `toolbar`, `body` |
| `SliceSection` | `body` | `FeatureSection` | `body`, `actions` |

Module, feature, slice - the same hierarchy an application's source is organized by. Both `FeatureSection`
and `SliceSection` name `body`, and that is not ambiguous: `fitsSlot` resolves against the direct parent.
See [composing screens from templates](./composing-screens.md) for how the chain is folded when it is
placed.

## Dialog templates

Seven, and none has a `fitsSlot` - a dialog is summoned rather than placed, so it occupies no parent slot.

| Template | For | Its own slots |
| --- | --- | --- |
| `ConfirmDialog` | One question with its consequence spelled out, and a way back | `header`, `body`, `actions` |
| `FormDialog` | A handful of fields captured without leaving the page underneath | `header`, `body`, `actions` |
| `DetailDialog` | A record over the list it came from, with a route to the full page | `header`, `body`, `sidePanel`, `actions` |
| `QuickCreateDialog` | A short create form, six fields at most | `header`, `body`, `actions` |
| `LookupDialog` | Search and a list to choose one or several records from | `header`, `body`, `actions` |
| `SideSheet` | A drawer from the side hosting a record or a form | `header`, `body`, `actions` |
| `FilterDialog` | The advanced filter builder, the phone's filter panel | `header`, `body`, `actions` |

## What the content is made of

Every template carries realistic seeded content - revenue figures, product rows, real column headers - not
placeholder text. A gallery whose dashboard shows four boxes labeled "Card" proves the renderer runs; one
that shows revenue, orders, customers and a table proves the blueprint is worth starting from.

The components are named by their **bare** names, so `resolveComponentName` decides which active package
owns each. That is what makes a template portable: the same `Dashboard` renders with PrimeReact's widgets
in one profile and somebody else's in another.

:::note
Two component names a dashboard obviously wants - `chart` and `fileUpload` - are declared by neither
`PrimeReact` nor `Cratis.Components`. Rather than reference names that would render as placeholders, the
templates use what exists: a table of monthly figures for revenue over time, and an image beside a
"Change photo" button for the profile photo.
:::

## Using one

A screen names the template whose shape it fills:

```ts
import { Screen } from '@cratis/scene.model';
import { LayoutName } from '@cratis/scene.blueprint.default';

const products: Screen = {
    name: 'Products',
    layout: LayoutName.AppShell,
    screenTemplate: 'CrudList',
    slotContent: {},
    forms: [],
    contributions: [],
};
```

To look at the shipped one first, boot its gallery screen:

```tsx
import { GalleryScreenPreview } from '@cratis/scene.blueprint.default';

<GalleryScreenPreview screenName='CrudList' />;
```

## Preview states

`GalleryScreenPreview` takes a `state`: `populated` (the seeded records, the default), `empty`, `loading` or
`error`. The state is applied with `applyTemplatePreviewState`, which changes only data-bearing elements -
those whose `rows` are records - and leaves the shell, headers and actions as authored. Each table then shows
its own state in its own vocabulary: no rows and its `emptyMessage`, an announced `Loading…` status with
`aria-busy`, or an announced error in place of the rows. Templates that load nothing, such as
`ProfileSettings`, look the same in every state.

Rendered against `core`, PrimeReact and this blueprint, every data template shows real rows when populated
and each state otherwise, with no unresolved components. The specs in `for_templatePreviewStates` render the
dashboard, list, master/detail, user administration, nested workspace, settings and dialog templates that way.
Form fields carry their label as an accessible name.

### Accessibility audit

`for_templateAccessibility` in both blueprints audits each template preview with axe-core's WCAG 2.0 and 2.1 A and
AA rules, in every data state for the default blueprint. The audit found, and the packages now fix, two real
defects: PrimeReact's sort trigger put `aria-sort` on the button, where WAI-ARIA does not allow it (the column
header now carries it), and a progress bar had no accessible name (it takes a `label`). Colour contrast and
page-level landmark rules need a real layout and a whole page, so jsdom cannot judge them; they are not asserted
here and need a browser run.

