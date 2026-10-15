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

## Data, not values

A component declares the shape of the data it shows - `value`, `change`, `status` accept a query result, a data context
or another component's output - and never embeds values. The values in the stories and specifications are samples for
drawing the states; a domain blueprint ships its preview data as a sample-data pack.
