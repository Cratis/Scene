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

## Configuring a template from the screen that uses it

A screen that fills a template does not copy it, and the template's author decides what the screen may change. The owner (an application's template, or a
layout) lists what it **exposes** - a component's property, or a collection with the operations and fields a consumer is granted - and the consuming screen
stores values for exactly that, apart from the template, in an **instance** block. In Screenplay:

```screenplay excerpt
exposure for Module
  component navigation
    items operations add reorder fields label icon destination

instance Orders
  items navigation.items
    item reports label "Reports" icon chart destination Orders.Reports
```

The engine's `resolveEffectiveConfiguration` merges the chain (layout, templates, screen) and `composeApplicationScreen` applies it, which is why Studio's preview,
the live Stage and a generated React application draw the same configured screen. What the screen was not exposed stays the template's, and a value for something not
(or no longer) exposed is kept but ignored and reported - see [exposure and configuration](../editing/exposure-and-configuration.md). The templates the default
blueprint ships expose nothing themselves: a screen filling `MasterDetail`, `Dashboard` or `ProfileSettings` changes the **content of the slots** the template declares
(`slotContent`), and an application wraps the shipped template in its own template when it wants to expose more.

### One package set from the template browser to the rendered vector

A host never hand-registers the components of a preview. It names the packages of a UI profile and `resolvePackageHost` resolves the effective set - the packages, their
dependencies (the default blueprint needs `PrimeReact` and `Cratis.Components`), their components, and the template catalog a template browser lists
(`host.templates`, each with compatibility, attribution and license). The vector that renders `MasterDetail`, `Dashboard` and `ProfileSettings` on the live Stage and as a
generated React application lists `Cratis.Blueprint.Default` in its `ui profile`; `for_templatePreviewStates/when_previewing_the_templates_through_the_host_package_set`
renders the same three templates through the set that profile resolves to - no findings, every template offered as usable, the same components as the audited registry,
and the slot contents the vector asserts by id - so the previews Studio's template browser shows and the pages the vector renders are made of the same packages.

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
page-level landmark rules need a real layout and a whole page, so jsdom cannot judge them; the browser run below does.

#### In a real browser

`for_templatePreviewStates/when_auditing_the_template_previews_in_chromium.browser.ts` (`yarn workspace @cratis/scene.blueprint.default test:browser`, run by the
JavaScript Build workflow, so a regression fails CI) renders **every** screen template the blueprint ships - business, foundation, state, support, auth, status and the nesting chain -
in Chromium against the registry a host with the blueprint's dependencies uses (`core`, PrimeReact with a theme preset, the blueprint), in every data state (populated, empty, loading,
error), at desktop, tablet and phone widths, in the light and the dark theme. Each page must have no axe-core violation of WCAG 2.0/2.1/2.2 A and AA - colour contrast and the
24 by 24 pixel target size included - no horizontal overflow, and a sound landmark structure (one `main`, no duplicate or nested landmarks, unique landmark names, all content inside a
landmark, a level-one heading). A last specification breaks the page it just judged (pale text, a second `main`, content outside a landmark, two tiny adjacent buttons) and expects each
finding, so a clean audit is never vacuous.

The audit found, and the blueprint now fixes: the bare `core:button` was 21 pixels high (the shell gives a button in the content area a 2rem minimum, in the application and the
full-page shell), and two `search` landmarks on one page (the topbar's and a list's) had no names to tell them apart (`foundation:globalSearch` names its form with its label).
The vector that renders the same templates on the live Stage and as a generated React application (below) found two more, which the blueprint's stylesheet now fixes: a grid item keeps
`min-width: auto`, so a widget holding a wide table pushed its track past the window (a phone scrolled sideways and, on a desktop, the dashboard's primary column overlapped its secondary
one) - every item of a template slot now shrinks to its track and the table scrolls inside itself - and PrimeReact's Lara tag severities painted white on a mid-tone in the light scheme
(2.3 to 3.8:1) - the blueprint darkens them to AA, leaving the dark scheme's values alone.

The page renders PrimeReact's unstyled primitives (`primereact/<component>`: a 13 pixel checkbox input, a 6 pixel date-picker trigger, a severity tag with no colour of its own);
the Stage swaps in the styled `@primereact/ui` components, so the target size of the primitives is not judged here, and a styled control's contrast is judged in the
vector rendered on the live Stage and as a generated React application (Cratis/Scene#95), which audits the same templates with the styled components.

