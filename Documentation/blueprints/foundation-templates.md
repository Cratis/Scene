---
title: Foundation screen templates
description: The foundation screen templates - workspace, dashboard, list, board, master/detail, record page, form and wizard - the dialog templates, and the auth and state screens, with their slots, the states, responsive rules and the definition of done each is held to.
---

The foundation screen templates are the screens most business applications are made of (Part B 2.1-2.9 of the Studio
screen editor and blueprints specification). They ship in `@cratis/scene.blueprint.default` under `foundation/templates`,
categorised `Foundation / <type>`, and are filled from the [foundation components](./foundation-components.md). They
require no component library, so a host with only this blueprint renders them.

Every one fits the `AppShell` layout's `content` slot, so any of them is placed in the shell with no shell code of its
own. The shell is the topbar (logo and name, global search, notifications, the environment badge and the user menu),
the sidebar (the navigation region view, grouped and collapsible, with badge counts) and the footer; its variants are
sidebar left (the default), top navigation only (the `Horizontal` layout mode) and a right utility panel.

| Template | Type | Fits | Slots | What it is |
| --- | --- | --- | --- | --- |
| `WorkspaceScreen` | Workspace | `content` | `moduleNav`, `moduleContent` | A module's sections beside the content of the section in force; the section is kept in the address |
| `DashboardScreen` | Dashboard | `content` | `header`, `kpis`, `charts`, `tables`, `aside` | Key figures, charts and tables; every region has its own five states |
| `ListScreen` | List | `content` | `header`, `toolbar`, `filters`, `list`, `bulkBar`, `footer` | Search, filters, a table, grouped list or cards, and a bulk bar for the selection |
| `BoardScreen` | Board | `content` | `header`, `toolbar`, `board` | Columns mapped to a stage; cards move by dragging or by each card's Move-to menu |
| `MasterDetailScreen` | Workspace | `WorkspaceScreen.moduleContent` | `list`, `details` | A list beside the selected record; offers the `master-detail.detail` outlet for `Detail` screens |
| `RecordPage` | Detail | `content` | `header`, `summary`, `tabs`, `main`, `related`, `activity`, `aside` | One record: key facts, tabs, related records and history |
| `FormScreen` | Form | `content` | `header`, `body`, `actions` | Sections of validated fields; create, edit, read-only and settings by mode; unsaved-changes guard |
| `WizardScreen` | Wizard | `content` | `header`, `progress`, `step`, `actions` | Linear steps with progress, Back/Next, save draft and a review step |

## Later additions

The later additions of Part B 2.12 are declared by the same rules: they ship in `@cratis/scene.blueprint.default` under `foundation/templates`, fit the `AppShell` layout's `content` slot, are
categorised `Foundation / <type>`, and are filled from the same sample-data pack. Their types (`Calendar`, `Timeline`, `Inbox`, `Settings`, `Profile`, `Report` and `Import`) are part of the
template type vocabulary of both engines.

| Template | Type | Slots | What it is |
| --- | --- | --- | --- |
| `CalendarScreen` | Calendar | `header`, `toolbar`, `filters`, `calendar`, `aside` | Events on a month, a week or an agenda, with filters and a list of what the period holds; the day and the view are kept in the address |

`MasterDetailScreen` names its container: the qualified slot `WorkspaceScreen.moduleContent` says which `content`-like
slot it means, so it is placed only inside a workspace and never ambiguous with the shell's own `content`.

## Dialogs

A dialog is summoned rather than placed, so a dialog template has no `fitsSlot`: it is offered on a state change slice (spec 4.2) and a host opens it over the
application. The five dialogs of Part B 2.10 are in the `Foundation / Dialog` category, built from the foundation components and the core `text` and `card`, and
filled from the same sample-data pack.

| Template | Slots | What it is |
| --- | --- | --- |
| `QuickCreateDialog` | `header`, `body`, `actions` | A short form of six fields at most with Cancel and Create, opened from a list's header or a lookup |
| `ConfirmDialog` | `header`, `body`, `actions` | A question, an optional consequence list, Cancel and a confirm button naming its verb; `tone: danger` makes it a destructive confirmation |
| `LookupDialog` | `header`, `body`, `actions` | Search and a list or table, single or multiple selection (`selectionMode`), Cancel and Select; any lookup field opens it |
| `SideSheet` | `header`, `body`, `actions` | A drawer from the inline end with a header, a scrollable body and footer actions, hosting a form or a record |
| `FilterDialog` | `header`, `body`, `actions` | The advanced filter builder in a dialog; on a phone it fills the page, which is the phone's alternative to the filter panel |

`FormDialog` and `DetailDialog` stay as they were, and gain the same frame. The head of every dialog is a `dialogFrame`. The host draws a dialog's box - a
`role="dialog" aria-modal="true"` element - and the frame takes that element on: it is named by the frame's heading, receives focus when it opens (the first
field, else the primary action, else the close button), keeps Tab inside, closes on Escape and gives focus back to whatever opened it. `placement` is `center`,
`side` or `full`, a right-to-left locale mirrors the side sheet, and on a phone every dialog fills the page with its footer actions kept in view while the body
scrolls. Cancel and Close carry a `CloseDialog` action as data, so the same document closes the dialog in Scene, in Stage and in the preview; with no behavior
attached the frame's close button and Escape close it themselves.

Preview a dialog with `GalleryDialogPreview` (`dialogName`, `pack`, `state`, `forceState`), which opens the real template in a host box; the stories show each
state.

## Auth and state screens

Four screens of Part B 2.11 fit the full-page layout's `content` slot, so they are chrome-less. They are categorised `Foundation / Auth` and `Foundation / State`.

| Template | Slots | What it is |
| --- | --- | --- |
| `LoginScreen` | `logo`, `error`, `form`, `providers`, `help` | The logo, a sign-in form, a slot for the identity providers the application offers, an error area that is a live region, and a help link |
| `NotFoundScreen` | `message`, `search`, `actions` | A wrong address explained, with a search and a link home |
| `ForbiddenScreen` | `message`, `actions` | A refusal that offers to request access and binds no data at all, so it shows nothing of what was refused |
| `ErrorScreen` | `message`, `reference`, `actions` | A generic failure with a retry and the support reference id to quote |

The state screens use the `emptyState` component for their message, so an error page reads as every empty region does.

## Aliases

Nothing was renamed. The spec names are new templates beside the earlier ones, which keep working:

| Spec name | Earlier template it stands beside |
| --- | --- |
| `LoginScreen` | `Login` |
| `NotFoundScreen` | `NotFound` |
| `ForbiddenScreen` | `AccessDenied` |
| `ErrorScreen` | `Error` |
| `QuickCreateDialog` | `FormDialog` |

`foundationTemplateAliases` lists the mapping. The components blueprint ships a `ConfirmDialog` of its own for a command; a template reference names its
blueprint (`resolveTemplateReference`), so the two never collide.

## Existing names keep working

`Dashboard`, `CrudList`, `MasterDetail`, `DetailView`, `FormPage`, `ModuleWorkspace`, `FeatureSection` and
`SliceSection` are unchanged. The foundation set is added next to them rather than renamed, so no screen that uses an
earlier template changes. The foundation templates are the ones a new blueprint should start from.

## Behaviour every template shares

- **Five standard states.** Loading, empty, error, no-permission and partial are owned by the foundation components, so
  a template shows them wherever its data does not answer. Preview them with `TemplatePreviewState` (populated, empty)
  and `forceState` on the gallery preview. One failed region never fails the page; no-permission leaks no data.
- **Permissions.** Every action control is enabled, disabled or hidden by the permission rule of its component.
- **Address-reflected state.** The list's search, sort, page and selection, and the master/detail selection, and the
  wizard's step live in the address, so a link shares the screen as it is and a refresh restores it. A wizard refresh
  can never land past a step that was not done.
- **Responsive rules.** The list becomes cards, master/detail becomes a navigation stack, the workspace's section rail
  becomes tabs and the sidebar becomes a drawer on a phone. Each template carries a compact arrangement override.
- **Keyboard.** The board's Move-to menu is the keyboard and screen-reader alternative to dragging.
- **Tokens only.** Styles use theme tokens; nothing carries a literal colour.

## Preview data is a sample-data pack

The templates declare where data comes from with a query binding, never a value. The rows are in
`sampleData/foundation-en.json`, a [sample-data pack](./sample-data.md) the manifest lists, so the same template is
previewed with one pack or another, or with real data from a host.

## Definition of done

Each template is held to Part B 6 by `verifyTemplateDefinitionOfDone` from `@cratis/scene.engine`, which any blueprint
package's specs can call for each of its templates:

```ts
import { verifyTemplateDefinitionOfDone } from '@cratis/scene.engine';

for (const template of source.screenTemplates ?? []) {
    it(`should hold ${template.name} to the definition of done`, () =>
        verifyTemplateDefinitionOfDone(template, source, library, { categoryPrefix: 'Foundation / ', pack }).should.deep.equal([]));
}
```

It reports, in words naming the template: incomplete metadata, a type outside the vocabulary, a missing category or
one outside the prefix, a display name or description that is missing or longer than a sentence, a thumbnail that is
not in the package, a declared slot the arrangement never places (or the reverse), a template the slot resolver cannot
place or that nests in itself, sample rows written inline, and a bound query the pack does not answer.
`verifyBlueprintPackage` covers the package as a whole; this is the per-template checklist.

Beyond that, the specs for the foundation set render every template at desktop, tablet and phone widths in light and
dark, in every state, with an accessibility audit; `when_auditing_the_templates_in_chromium.browser.ts` runs it in a
real browser in CI.
