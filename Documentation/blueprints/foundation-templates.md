---
title: Foundation screen templates
description: The eight foundation screen templates - workspace, dashboard, list, board, master/detail, record page, form and wizard - their slots, the shell they sit in, the states, responsive rules and the definition of done each is held to.
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

`MasterDetailScreen` names its container: the qualified slot `WorkspaceScreen.moduleContent` says which `content`-like
slot it means, so it is placed only inside a workspace and never ambiguous with the shell's own `content`.

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
