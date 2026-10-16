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

`dataList` also takes three options for the domain blueprints. `imageField` names the field with a picture's address and puts a picture on each
card (initials for a row that has none; the title beside it names the row, so the picture is decoration). A column of `kind: progress` draws a
0 to 100 value as a progress bar named by its column, with the figure in words. `toneField` names the field holding a row's tone (`warning`,
`danger`, `success`) and tints the row - an emphasis that always goes with a status column saying the same in an icon and words, so colour is
never the only cue (a low-stock item is tinted *and* says "Low stock").

A search box and the list it narrows are separate components that agree through one address parameter: `globalSearch` `urlKey: 'itemsq'` and a
`dataList` `urlKey: 'items'` share `itemsq`, so typing narrows the list and the search is part of the link. A component that writes a parameter tells
every other component using it. `orgTree` takes `urlKey` too: the chosen node is kept in the address, so a refresh restores it, and a list whose
search parameter is the same one narrows to the chosen branch - give the tree nodes ids that are their paths and a row's location starts with its
branch's id.

`permissionMatrix` shows every role across by default. Name one in `focusRole` and it shows that role alone - bind it to a roles list's chosen row, the
`value` output, for a matrix beside the list of roles. While no role is named, or the one named does not exist, every role is shown rather than nothing; the grants
the matrix publishes are always the whole set.

## Boards

`kanbanBoard` shows a count and the over-limit warning in each column header. Name a numeric card field in `totalField` (a deal's `amount`) and the
header also shows the total of that field over the cards in the column, formatted by `format` (`currency` with a `currency` code, `percent`,
`compact` or a plain number) in the element's `locale`. The totals follow a card when it is moved, by dragging or by its Move-to menu, so a
pipeline's header always says what each stage is worth.

`swimlane: assignee` lays the board out in a lane for each person, across the same columns: lanes appear in the order the people first appear in the cards,
the unassigned cards last, and a lane has its own heading (a level above its columns', so the outline stays in order). A card moves between columns within
its lane, by dragging or by its Move-to menu; each column's count and total are for its lane, while the over-the-limit warning counts every lane, since a limit
is the column's.

## Deciding from a list

`dataList` keeps a row's actions in a menu. For a list whose point is a decision - an approver's inbox - set `rowActionStyle` to `buttons` and each
action is a button of its own in the row or card, named for its request ("Approve: Leave: Isla Morgan"), so a decision is one press away. The
permission rule applies as it does to the menu: disabled buttons say why on hover, hidden ones are not drawn.

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
