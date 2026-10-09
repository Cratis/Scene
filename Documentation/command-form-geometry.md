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
