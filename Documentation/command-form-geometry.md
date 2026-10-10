---
title: Command form geometry
description: Platform-neutral command-form layout metadata and editing behavior for Scene hosts.
---

## Contract

Command forms keep field generation separate from geometry:

- `generationMode` / component `mode` decides whether fields come from command metadata (`auto`) or authored fields (`manual`).
- `layout` carries geometry only: columns, gaps and field placements.
- `composeUsing` remains a composition callback reference for field values. It is not a width token and is never interpreted as unequal-column geometry.

A `CommandFormLayout` contains:

- `columns[]`: one-based `index` with optional typed `width`, `minWidth` and `maxWidth`.
- `placements[]`: field name, one-based `row` and `column`, optional row/column spans and optional typed field width.
- `columnGap` / `rowGap`: optional typed widths.

Widths use explicit units: `fraction`, `pixels`, `percent` or `auto`. Legacy strings such as `2fr`, `320px`, `50%` and `auto` can be migrated, but arbitrary strings are rejected.

## Editing behavior

Scene owns pure edit helpers for geometry:

- `updateCommandFormFieldPlacement()` updates field placement as a draft.
- `resizeCommandFormColumn()` updates column width as a draft.
- `commitCommandFormLayoutDraft()` commits only valid drafts and otherwise keeps the previous committed layout.
- `preserveDirtyCommandValues()` merges refreshed command values without overwriting dirty fields.

Invalid draft state is separate from committed metadata so Studio can show resize/placement errors without corrupting the form that Stage or the runtime renders.

## Downstream use

Screenplay should render authored form placement and width units into `CommandFormLayout`. Stage and Studio should consume `layout` for geometry and keep `mode`/`generationMode` for field generation. Studio resize interactions should call the draft helpers and apply canonical `SceneEdit` operations only after validation succeeds.

## Compact widths and keyboard arrangement

A host that evaluates the width size class passes it as the form's `widthSizeClass` property. At `Compact` a manual form stacks its fields in one full-width column in reading order (`stackCommandFormLayout`): row, then column, then authored order. The authored layout is not changed, so the form returns to its columns at `Regular`.

The `commandFormLayout` property editor arranges fields from the keyboard. Each placed field is a focusable cell whose accessible name states its row, column and spans. An arrow key moves the field one cell, and Shift with an arrow key narrows or widens its column span (Left, Right) or its row span (Up, Down). Each valid change is one canonical `SetProperty` edit of `layout`. A change that would leave the declared columns is announced and not applied (`applyCommandFormLayoutKey`).
