---
title: Foundation components
description: The composite components every blueprint builds its screens from - stat card, chips, empty state, charts, filters, checklists and the rest - what each declares, the five standard states every data-showing one implements, and how to preview and verify them.
---

The foundation components are the content that fills the slots of the foundation screen templates (Part B of the
Studio screen editor and blueprints specification). They live in `@cratis/scene.blueprint.default` under
`foundation/`, are registered under the package's own names, and are categorised, described and iconed like every other
component, so a component picker shows them and a screen places them like any other.

| Component | Category | What it is |
| --- | --- | --- |
| `emptyState` | Feedback | An icon, a headline, a hint and one primary action; embeddable in any region |
| `statCard` | Data display | One key figure with its label, trend and the period compared to |
| `trendChip` | Data display | A change as direction, magnitude and whether it is good |
| `statusChip` | Data display | A status as a semantic color, an icon and its text |
| `chartWrapper` | Data display | One chart - `line`, `bar`, `stacked`, `donut` or `funnel` - as scalable graphics with a legend and a table of the same data |
| `filterBuilder` | Input | Field, operator and value conditions joined by AND or OR in groups nested three deep; publishes the filter as its `value` |
| `columnChooser` | Actions | Which columns a table shows and in what order, with locked columns; publishes the visible ids as its `value` |
| `savedViewsMenu` | Actions | A list's saved views as a menu button, with save and manage commands that honour permission rules |
| `checklistSection` | Data display | Sections of tasks with owner, due date and a progress bar each; publishes the done task ids |
| `activityFeed` | Data display | What happened to a record, grouped by day, with the kind of each entry named in words |
| `avatarStack` | Data display | Overlapping avatars for the people on a record with a "+N" chip for the rest |
| `fileUploader` | Input | A drop zone and file picker checked for type and size; sends through a host handler when one is provided |
| `approvalChainStepper` | Navigation | The steps a request goes through and where it stands; a rejection stops the chain |
| `orgTree` | Data display | An organization as an expandable ARIA tree built from rows of who reports to whom |
| `permissionMatrix` | Input | Roles across, permissions down, a checkbox where they meet; publishes the grants |
| `dialogFrame` | Feedback | The head of a dialog template: title, message, consequences and a close button - and the focus handling, placement and name of the dialog it opens in (see [foundation screen templates](./foundation-templates.md#dialogs)) |
| `actionButton` | Actions | One action drawn as every foundation action is, enabled, disabled with its reason or hidden by the permission rule; runs the behaviors attached to it |
| `notice` | Feedback | One message about a region as a live region - an alert for an error or warning, a status otherwise - present but empty until it has something to say |

## The five standard states

Every data-showing component defines the states of Part B 1.4, and all of them are previewable by setting the `state`
property:

| State | What is drawn |
| --- | --- |
| `loading` | A skeleton in the shape of the content, announced as a status - never a spinner alone |
| `empty` | An explanation and the primary action, with the action's permission rule applied |
| `error` | The message and a retry; the behaviors attached to the component run when it is pressed |
| `noPermission` | What is missing, and none of the data; no actions are offered |
| `partial` | The loaded part, with a note naming the regions that failed and a retry |

Without a forced `state` the component follows the properties a bound query already publishes: `forbidden`, `error`,
`loading`, `failedRegions`, and otherwise whether it has data. The same names the table preview states use, so a screen
that already reports `loading` and `error` needs nothing more.

## Cross-cutting rules (Part B 1.5)

- **Tokens only.** Colors, radii and spacing come from the theme tokens and one spacing scale; a specification
  scans the stylesheet and fails on a color literal or a spacing length. The status tokens are in the [theme tokens](theme-tokens.md).
- **Localization.** A component's own text comes from a strings table (`foundationStrings`) merged with the element's
  `strings` property. Dates, numbers and currency are formatted with `Intl` for the element's `locale`, else the document language.
- **Right to left.** Direction-sensitive CSS uses logical properties, so a `dir="rtl"` page needs no second stylesheet.
- **Density.** Tabular components take `density`: `comfortable` or `compact`.
- **Permissions.** Every action control takes a rule - `enabled`, `disabled` (shown, refuses, and says why) or `hidden` -
  so a template never assumes a role.
- **Accessibility.** A labelled component is an ARIA region; status is icon plus text plus color; focus is visible;
  skeletons respect `prefers-reduced-motion`.

## Preview and verification

`FoundationStates` draws every state of one component in one theme, and the Storybook stories under
*Blueprint / Foundation components* show each component in the light and the dark theme. Three specifications guard the rules:

- the jsdom specifications render every component in every state and audit it with axe-core;
- `yarn test:browser` (in the package) drives Chromium at desktop, tablet and phone widths in both themes with colour
  contrast enabled, and asserts no page overflow;
- a stylesheet specification enforces tokens only.

## Charts

`chartWrapper` takes `categories` and `series` (a named list of values per category). A donut and a funnel draw the first series, one
slice or stage per category. The drawing is hidden from assistive technology and a table of the same numbers follows it ("Chart data").
Series are told apart by marker shape, dash and hatch as well as by color, so no chart relies on color alone (WCAG 1.4.1). The chart
draws at the width it is shown at, so its labels keep their size on a phone.

## Controls that publish a value

`filterBuilder`, `columnChooser` and `savedViewsMenu` do not change data themselves: each publishes what the user chose as its `value`
output - the filter `{ operator, conditions, groups }`, the ordered visible column ids, the chosen view id - which a list screen binds
its query and table to with a component-property binding, the same way the input widgets do. `savedViewsMenu` also publishes `save` or
`manage` on its `action` output when the user asks for those commands. A filter bound in through `filter` is read back as the user left
it, and conditions on fields that no longer exist are dropped rather than shown broken.

## Lists of records

`checklistSection` (`sections` of `items` with `id`, `label`, `owner`, `due`, `done`) shows progress as a labelled progress bar and says
"Overdue" in words for an open task past its due day. `activityFeed` takes `entries` (`id`, `actor`, `action`, `kind`, `at`, `body`) and
groups them by calendar day in `timeZone`, newest first unless `order` is `ascending`; the application supplies the content.
`avatarStack` takes `people` (`name`, optional `imageUrl`) and folds those beyond `max` into a "+N" chip, announced as "N more".

## Uploading files

`fileUploader` checks a selection against `accept` (extensions, MIME types, wildcards), `maxSizeMb` and `multiple` before anything is
sent, and says why a file was refused. Its input is a real file input behind a labelled button, so it works from the keyboard. The selection
(name, size, type, status) is published as `value`. Sending is the host's: wrap the screen in `FileUploaderHandlerProvider` with a
`(files, serverUrl) => Promise<void>` - the same signature `@cratis/scene.primereact` uses for its `fileUpload`, so one function serves
both - and files are marked uploading, done, or failed with a retry. Without a handler the uploader only collects.

## Approvals, organizations and permissions

`approvalChainStepper` applies the chain's own rules so a request page needs none: a rejection stops the chain and the steps after it read
"Not reached"; with no step marked current the first undecided step is the current one; only one step is ever current. The overall
outcome (approved, rejected, waiting, not started) is stated above the steps, and the current step carries `aria-current="step"`.

`orgTree` builds its tree from flat rows (`id`, `label`, `title`, `parentId`), as a query returns them. Someone whose manager is missing
becomes a root, a reporting cycle is cut, and the first `expandedDepth` levels start open. It follows the ARIA tree pattern with one tab
stop: Up and Down move, Right expands or enters, Left collapses or goes to the parent, Home and End jump, Enter or Space selects.

`permissionMatrix` takes `roles`, `permissions` (optionally grouped) and `grants` (rows of `role` and `permission`); grants of something that
does not exist are ignored. Every header is a real header cell and each box is named "Grant *permission* to *role*". Without the edit
permission each cell says "Allowed" or "Not allowed" in words and by icon. Wide matrices scroll inside a keyboard-focusable region.

## Data, not values

A component declares the shape of the data it shows - `value`, `change`, `status` accept a query result, a data context
or another component's output - and never embeds values. The values in the stories and specifications are samples for
drawing the states; a domain blueprint ships its preview data as a sample-data pack.
