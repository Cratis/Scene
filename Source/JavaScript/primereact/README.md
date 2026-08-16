# @cratis/scene.primereact

The PrimeReact component package for Scene. It maps Scene's abstract component names onto real
PrimeReact 10 components, and PrimeReact's free PrimeTek themes onto Scene `Theme` objects.

User-facing documentation lives in [`Documentation/primereact-package/`](../../../Documentation/primereact-package/index.md).
This file is the contributor's note: the conventions the source follows and the reasoning behind them.

## Layout

```text
primereact/
├── primeReactPackage.ts        the ScenePackage manifest + the ScenePackageBundle
├── primeReactComponents.ts     the ComponentRegistry - every abstract name to its adapter
├── properties.ts               typed readers for element.properties
├── menuItems.ts, treeNodes.ts  shared readers for the two nested models PrimeReact reuses
├── primeReactTheme.css         the Scene token <-> PrimeReact variable bridge
├── storyElements.ts            fixture builders the galleries share
├── button/ data/ form/ media/ menu/ messages/ misc/ overlay/ panel/ screen/
│                               one adapter per file, grouped by PrimeReact family
├── theme/                      the theme catalog, the stylesheet helper and the live swap
└── for_*/                      BDD specs beside the code they specify
```

## Conventions

**Adapters are named `Prime<Component>`.** The adapter for `dropdown` is `PrimeDropdown`, in
`form/PrimeDropdown.tsx`. The prefix exists because the file also imports PrimeReact's own `Dropdown`,
and two things called `Dropdown` in one file is how confusion starts. It follows the `CoreButton` /
`CoreText` precedent in `@cratis/scene.react`.

**Abstract names are `lowerCamelCase`** — `inputText`, `dataTable`, `selectButton`. The abstract name
follows what the component *is*, not what PrimeReact 10 happens to call it: `toggleSwitch` maps onto v10's
`InputSwitch`, and v11 renames that component to `ToggleSwitch`, so the abstract name was already right.

**Three names are deliberately shared with `core`** — `text`, `button` and `card`. That is override
priority working as designed, not a collision. Seven more (`table`, `column`, `title`, `field`,
`section`, `summary`, `action`) are the directive kinds Screenplay's screen vocabulary compiles to.

**Read properties through `properties.ts`, never with a cast.** `@typescript-eslint/no-explicit-any` is
an error here, and a cast would let a mistyped property reach PrimeReact instead of falling back. The
readers treat a wrongly typed property exactly like a missing one.

**Local state where a Scene element cannot express it.** A `SceneElement`'s `properties` are authored
design-time configuration; there is nowhere in the model to put "what the user typed" or "the user closed
the dialog". Every interactive adapter therefore seeds local state from its properties. The consequence
is intentional: a preview is operable rather than frozen, and the interaction stays local to the rendered
component.

## The token vocabulary

Thirteen semantic tokens, and every Scene package must agree on them — a vocabulary that grows per
package is one no package can rely on. `primeReactTheme.css` is the only place the Scene names and
PrimeReact's names meet.

| Scene token | CSS custom property | PrimeReact 10 variable |
| --- | --- | --- |
| `primary.color` | `--scene-primary-color` | `--primary-color` |
| `primary.contrastColor` | `--scene-primary-contrast-color` | `--primary-color-text` |
| `surface.background` | `--scene-surface-background` | `--surface-ground` |
| `surface.card` | `--scene-surface-card` | `--surface-card` |
| `surface.border` | `--scene-surface-border` | `--surface-border` |
| `surface.hover` | `--scene-surface-hover` | `--surface-hover` |
| `surface.overlay` | `--scene-surface-overlay` | `--surface-overlay` |
| `text.color` | `--scene-text-color` | `--text-color` |
| `text.mutedColor` | `--scene-text-muted-color` | `--text-color-secondary` |
| `highlight.background` | `--scene-highlight-background` | `--highlight-bg` |
| `highlight.color` | `--scene-highlight-color` | `--highlight-text-color` |
| `content.borderRadius` | `--scene-content-border-radius` | `--border-radius` |
| `focus.ring` | `--scene-focus-ring` | `--focus-ring` |

The bridge runs both ways, and the scoping is load-bearing. On `:root`, each Scene token falls back to
the loaded PrimeReact theme. Inside `[data-scene-theme-root]` — the element `SceneThemeProvider` writes
tokens onto — the Scene tokens are fed back onto PrimeReact's variables. The second rule must never move
to `:root`: custom properties that reference each other on the *same* element form a cycle, are invalid
at computed-value time, and resolve to nothing.

## Themes

25 free PrimeTek themes. Token values are read verbatim from each theme's own `theme.css` `:root` block,
so a Scene token always agrees with what the PrimeReact stylesheet renders — including `lara-light-teal`,
which really does ship the same color for `--highlight-bg` and `--highlight-text-color`. There is one
deliberate deviation: PrimeReact 10.9.8 ships `viva-dark` with an unresolved SCSS expression,
`rgba($primaryColor, 0.08)`, for `--surface-hover`; that is not valid CSS, so the intended value is used
instead.

Every theme is PrimeTek's work and none is ours. Attribution is applied once in `primeReactThemes.ts` to
every preset rather than written per theme, so a twenty-sixth theme cannot be added without it. The full
attribution table is in
[the theme reference](../../../Documentation/primereact-package/theme-reference.md).

| Field | Value |
| --- | --- |
| `author` | `PrimeTek` |
| `authorUrl` | `https://primereact.org` |
| `license` | `MIT` — verified in `node_modules/primereact/LICENSE.md`: "The MIT License (MIT), Copyright (c) 2016-2025 PrimeTek" |

`compatibleWith` is `['PrimeReact', 'Tailwind', 'core']`. `core` is listed deliberately:
`ThemeCompatibility` has no implicit exemption for it, and these themes genuinely reach `core`'s
components — through the semantic token layer `SceneThemeProvider` applies to the whole subtree, though
not through the PrimeReact stylesheet, which only ever matches `.p-*` elements.

## Not covered

| Component | Why |
| --- | --- |
| `chart` | PrimeReact's `Chart` is a thin wrapper over Chart.js and does nothing without `chart.js` installed and a full Chart.js configuration object. Adding a charting library as a dependency of a component-mapping package is out of scope; charting deserves its own Scene package with its own vocabulary. |
| `editor` | `Editor` wraps Quill and needs `quill` installed. Same reasoning — a rich-text editor is a product decision, not a mapping. |

Both are genuinely useful and both are deliberate omissions, not oversights. A profile needing them
should activate a package that owns that dependency.

Also worth knowing: `column` renders nothing on its own. That is PrimeReact's own semantics — a bare
`<Column/>` outside a `DataTable` renders nothing either. When a `column` element is nested under
`dataTable` or `table`, the table reads its `field`/`header`/`sortable` off the *model* (`element.slots`)
rather than the rendered node, because PrimeReact identifies its columns by React element type and a
wrapper would not be recognized as one.

## Migrating to PrimeReact 11

PrimeReact 11 exists, but this package targets **10.9.8** and must keep doing so: Cratis Studio pins
`primereact` to `10.9.8` through a root `resolutions` entry, and `@cratis/components` depends on exactly
that version. Import from `primereact/*` only — never `@primereact/*` or `@primeuix/themes`.

The renames are recorded here so the eventual port is a known quantity rather than a discovery.

### Renames

| PrimeReact 10 | PrimeReact 11 |
| --- | --- |
| `Dropdown` | `Select` |
| `Calendar` | `DatePicker` |
| `OverlayPanel` | `Popover` |
| **`Sidebar`** | **`Drawer`** |
| `InputSwitch` | `ToggleSwitch` |
| `TabView` + `TabPanel` | `Tabs` |
| `InputTextarea` | `Textarea` |
| `Password` | `InputPassword` |
| `Chips` | `InputTags` |
| `ColorPicker` | `InputColor` |
| `Galleria` | `Gallery` |
| `ScrollPanel` | `ScrollArea` |
| `SelectButton` | `ToggleButtonGroup` |

> [!WARNING]
> **`Sidebar` is the trap.** v10's `Sidebar` becomes `Drawer`, *and* v11 introduces a brand-new,
> unrelated `Sidebar` for application-shell navigation. A port that follows the name rather than the
> behavior silently swaps a slide-in overlay for a static shell element, and it will compile.

### Moved to commercial packages

`Chart` and `Editor` move to `@primeuipro/*` and have no React release yet. This package does not map
either of them, so nothing here is affected.

### Became hooks

`InputMask`, `KeyFilter`, `ScrollTop`, `OrderList` and `PickList` are hooks in v11 rather than
components. The four this package maps — `inputMask`, `scrollTop`, `orderList`, `pickList` — each need a
rewrite, not a rename.

### Removed

`ConfirmPopup`, `BlockUI`, `PanelMenu`, `TabMenu`, `DeferredContent`, `DataScroller`,
`TriStateCheckbox`, `MultiStateCheckbox`, `SlideMenu`, `Mention`, `Dock` and `Ripple` are gone. Four of
them are mapped here — `blockUI`, `panelMenu`, `tabMenu` and `dock` — and each needs a replacement built
from what remains, or the abstract name retired from the manifest.

### Icons

v11 components ship **no icons**. Every `icon` property this package passes through assumes `primeicons`
is loaded, which stays true, but v11's own components no longer bundle their internal ones.

## Gates

Run from this folder:

```bash
yarn build          # tsc -b + rollup
yarn test           # vitest
yarn lint:ci        # eslint, zero warnings
yarn build-storybook
```
