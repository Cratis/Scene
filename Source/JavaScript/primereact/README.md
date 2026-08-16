# @cratis/scene.primereact

The PrimeReact component package for Scene. It maps Scene's abstract component names onto real
PrimeReact 11 components, and PrimeTek's `@primeuix/themes` presets onto Scene `Theme` objects.

User-facing documentation lives in [`Documentation/primereact-package/`](../../../Documentation/primereact-package/index.md).
This file is the contributor's note: the conventions the source follows and the reasoning behind them.

## Layout

```text
primereact/
├── primeReactPackage.ts        the ScenePackage manifest + the ScenePackageBundle
├── primeReactComponents.ts     the ComponentRegistry - every abstract name to its adapter
├── properties.ts               typed readers for element.properties
├── menuItems.ts, treeNodes.ts  shared readers for the two nested models the menus and trees reuse
├── MenuItem.ts, TreeNode.ts    those two models - Scene's own since v11 removed PrimeReact's
├── primeReactTheme.css         the Scene token <-> PrimeReact design-token bridge
├── storyElements.ts            fixture builders the galleries share
├── button/ data/ form/ media/ menu/ messages/ misc/ overlay/ panel/ screen/
│                               one adapter per file, grouped by PrimeReact family
├── theme/                      the theme catalog and the preset resolution behind it
└── for_*/                      BDD specs beside the code they specify
```

## Conventions

**Adapters are named `Prime<Component>`.** The adapter for `dropdown` is `PrimeDropdown`, in
`form/PrimeDropdown.tsx`. The prefix exists because the file also imports PrimeReact's own `Dropdown`,
and two things called `Dropdown` in one file is how confusion starts. It follows the `CoreButton` /
`CoreText` precedent in `@cratis/scene.react`.

**Abstract names are `lowerCamelCase`** — `inputText`, `dataTable`, `selectButton`. The abstract name
follows what the component *is*, not what PrimeReact happens to call it this major version:
`toggleSwitch` mapped onto v10's `InputSwitch`, and v11 renamed that component to `ToggleSwitch` - the
abstract name had been right all along and did not move.

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

| Scene token | CSS custom property | PrimeReact 11 design token |
| --- | --- | --- |
| `primary.color` | `--scene-primary-color` | `--p-primary-color` |
| `primary.contrastColor` | `--scene-primary-contrast-color` | `--p-primary-contrast-color` |
| `surface.background` | `--scene-surface-background` | `--p-surface-50` / `--p-surface-950` |
| `surface.card` | `--scene-surface-card` | `--p-content-background` |
| `surface.border` | `--scene-surface-border` | `--p-content-border-color` |
| `surface.hover` | `--scene-surface-hover` | `--p-content-hover-background` |
| `surface.overlay` | `--scene-surface-overlay` | `--p-overlay-popover-background` |
| `text.color` | `--scene-text-color` | `--p-text-color` |
| `text.mutedColor` | `--scene-text-muted-color` | `--p-text-muted-color` |
| `highlight.background` | `--scene-highlight-background` | `--p-highlight-background` |
| `highlight.color` | `--scene-highlight-color` | `--p-highlight-color` |
| `content.borderRadius` | `--scene-content-border-radius` | `--p-content-border-radius` |
| `focus.ring` | `--scene-focus-ring` | `--p-focus-ring-shadow` |

The v10 column of this table was an ad-hoc vocabulary that could only be learned by reading compiled
stylesheets; v11's is one systematic `--p-*` namespace derived from the preset's own token paths, so
the bridge shrank.

The bridge runs both ways, and the scoping is load-bearing. On `:root`, each Scene token falls back to
the active preset's `--p-*` value. Inside `[data-scene-theme-root]` — the element `SceneThemeProvider` writes
tokens onto — the Scene tokens are fed back onto PrimeReact's variables. The second rule must never move
to `:root`: custom properties that reference each other on the *same* element form a cycle, are invalid
at computed-value time, and resolve to nothing.

## Themes

24 themes across the four `@primeuix/themes` preset families - Aura, Lara, Nora and Material - each bound
to one of the preset's own primitive color ramps for its accent.

The token values are **generated**, not transcribed. A v10 theme was a compiled stylesheet whose `:root`
block could be read with a text editor; a v11 preset is a JavaScript object whose values are token
references (`{emerald.500}`, `light-dark({surface.0}, {surface.900})`) that `@primeuix/styled` resolves at
runtime. What is committed in `themePresets.ts` is the output of running those same resolution rules, so
the catalog stays plain data a picker can read without booting a theme engine while still agreeing with
what the preset renders. A spec fails the build if any token still holds an unresolved reference.

Every theme is PrimeTek's design work and none is ours - Scene picks the accent and nothing else.
Attribution is applied once in `primeReactThemes.ts` to every preset rather than written per theme, so a
twenty-fifth theme cannot be added without it. The full attribution table is in
[the theme reference](../../../Documentation/primereact-package/theme-reference.md).

| Field | Value |
| --- | --- |
| `author` | `PrimeTek` |
| `authorUrl` | `https://primereact.org` |
| `license` | `PrimeUI Commercial` - **not MIT.** v10 and its themes were MIT; v11 relicensed the whole stack. See [Licensing](#licensing). |

`compatibleWith` is `['PrimeReact', 'Tailwind', 'core']`. `core` is listed deliberately:
`ThemeCompatibility` has no implicit exemption for it, and these themes genuinely reach `core`'s
components - through the semantic token layer `SceneThemeProvider` applies to the whole subtree, though
not through the `--p-*` properties, which only PrimeReact's own components read.

## Not covered

| Component | Why |
| --- | --- |
| `chart` | PrimeReact's `Chart` is a thin wrapper over Chart.js and does nothing without `chart.js` installed and a full Chart.js configuration object. Adding a charting library as a dependency of a component-mapping package is out of scope; charting deserves its own Scene package with its own vocabulary. |
| `editor` | `Editor` wraps Quill and needs `quill` installed. Same reasoning — a rich-text editor is a product decision, not a mapping. |

Both are genuinely useful and both are deliberate omissions, not oversights. A profile needing them
should activate a package that owns that dependency.

Also worth knowing: `column` renders nothing on its own, and since PrimeReact 11 that is *our* semantics
rather than PrimeReact's. v11 removed `primereact/column`, so `data/Column.tsx` is a Cratis-owned
declaration component that returns `null`. When a `column` element is nested under `dataTable` or `table`,
the table reads its `field`/`header`/`sortable` off the *model* (`element.slots`) rather than the rendered
node - which is why the derivation survived the v11 port unchanged.

## PrimeReact 11

This package targets **11.1.0**. The full record of the port from 10.9.8 - every rename, every abstract
name that lost its component, and what was built, converted or dropped for each - is in
[the migration page](../../../Documentation/primereact-package/primereact-11-migration.md).

The short version for a contributor:

- **v11 is compositional.** `primereact/select` exports `Select.Root` / `Trigger` / `Value` / `Portal` /
  `Positioner` / `Popup` / `List` / `Option` and you assemble them. Most renames are more than an import.
- **`Sidebar` is the trap.** v10's `Sidebar` is v11's `Drawer`, *and* v11 introduces a brand-new,
  unrelated `Sidebar` for application-shell navigation. Following the name rather than the behavior
  compiles cleanly and silently swaps an overlay for a static shell.
- **v11 ships zero CSS.** There is no `primereact/resources` directory. A look comes from a preset handed
  to `PrimeReactProvider`; `usePrimeReactTheme` returns that configuration for a Scene theme.
- **14 abstract names are now backed by Cratis-owned components** built here because v11 removed theirs,
  2 are expressed over `@primereact/headless` hooks, and 4 were dropped from the manifest
  (`cascadeSelect`, `inputMask`, `treeTable`, `virtualScroller`).
- **`MenuItem` and `TreeNode` are Scene's types now** - `primereact/menuitem` and `primereact/treenode`
  were removed. Import them from this package, never from `primereact/*`.

### Licensing

PrimeReact 10 was MIT. PrimeReact 11 is not, and neither is `primeicons` 8, `@primereact/core`,
`@primereact/headless`, `@primeuix/themes` or `@primeuix/styled` - all are under the commercial PrimeUI
license and **require a license key regardless of how you style**. The check runs in `PrimeReactProvider`
on mount with no condition on `unstyled`, on `theme`, or on `NODE_ENV`; without a key you get a console
warning and an "Invalid PrimeUI License" banner in development and production alike.

See [the migration page](../../../Documentation/primereact-package/primereact-11-migration.md#licensing)
for the community and commercial tiers and the redistribution clause.

## Gates

Run from this folder:

```bash
yarn build          # tsc -b + rollup
yarn test           # vitest
yarn lint:ci        # eslint, zero warnings
yarn build-storybook
```
