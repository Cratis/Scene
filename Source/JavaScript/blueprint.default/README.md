# @cratis/scene.blueprint.default

The default **blueprint** for Scene: the application shells an application picks once, the screen and
dialog templates that go inside them, the components that fill their slots, and two themes.

User-facing documentation lives in [`Documentation/blueprints/`](../../../Documentation/blueprints/index.md).
This file is the contributor's note: the conventions the source follows and the reasoning behind them.

## Layout

```text
blueprint.default/
├── defaultBlueprint.ts             the ScenePackage manifest + the ScenePackageBundle
├── defaultBlueprintComponents.ts   the ComponentRegistry - every bare name to its shell component
├── ComponentName.ts                the bare names this blueprint declares
├── packageName.ts                  the name a ui profile lists it under
├── configuration/                  the layout-mode state machine, its React provider and persistence
├── layouts/                        the two Layout definitions and the flow builders behind them
├── shell/                          the sixteen shell components, and layout.css
├── gallery/                        the screen and dialog templates, the screens, and preview helpers
├── themes/                         the two themes and the provider that applies them
└── for_*/                          BDD specs beside the code they specify
```

## The four things this ships, and why they are four

| Concept | What it is | How many |
| --- | --- | --- |
| **Layout** | the application's base navigational look | one per application, chosen from two |
| **Screen template** | a reusable shape *inside* a layout, at module / feature / slice level | twenty-three |
| **Dialog template** | the same, for overlays - no `fitsSlot`, because a dialog occupies no parent slot | three |
| **Screen** | an instance: names its layout and template, and provides the content | twenty-three |

A screen template states where it belongs, in `fitsSlot`, rather than being told by whatever hosts it.
That one rule composes at every depth: a module's template fits the layout's `content`, a feature's fits a
slot the module declares, a slice's fits one the feature declares. `nestScreenTemplates` folds a chain from
the inside out, and `ModuleWorkspace` → `FeatureSection` → `SliceSection` exists to be asserted rather than
only described.

## Regions (slots)

`topbar`, `sidebar`, `menu`, `breadcrumb`, `content`, `footer`, `rightPanel`, `configPanel`, `aside`.

Sakai establishes topbar/sidebar/menu/content/footer; the premium PrimeTek templates add the breadcrumb
and the right panel; `aside` is the branding half of a full-page screen's split. All of them are here,
because a blueprint covering only the free template's regions forces a fork on anyone wanting the others.

`SlotName` is one enum used by the layouts, the templates and the shell components, because a slot filled
under a name the shell never reads renders nothing and reports nothing.

## Layout modes

Eight, plus a mobile regime nobody selects. The class vocabulary is PrimeTek's, unchanged.

| Mode | Wrapper class | What it does |
| --- | --- | --- |
| Static | `layout-static` | Sidebar docked at 18rem; content pushed by a matching margin, never covered |
| Overlay | `layout-overlay` | Sidebar parked off-canvas; opening floats it over the content behind a mask |
| Slim | `layout-slim` | 5rem icon-only rail, circular buttons; submenus pop out at the rail's width |
| Slim+ | `layout-slim-plus` | 7rem rail with each label stacked under its icon |
| Compact | `layout-compact` | The 5rem rail with square buttons; the topbar shifts by the rail width too |
| Horizontal | `layout-horizontal` | Sidebar goes `position: static` into the topbar as a nowrap row; submenus drop down |
| Reveal | `layout-reveal` | Full panel translated off-left behind a 4.25rem icon strip; hover slides it in over the content; a pin pushes the content out instead |
| Drawer | `layout-drawer` | A 5.25rem rail that *animates its width* to full on hover - reveal slides, drawer grows - and pins the same way |

State classes: `layout-static-inactive`, `layout-overlay-active`, `layout-sidebar-active`,
`layout-sidebar-anchored`, `layout-mobile`, `layout-mobile-active`. Menu tint:
`layout-menu-light|dark|primary`. Color scheme: `layout-color-scheme-light|dark`.

**Mobile is not a mode.** At or below 991px `effectiveLayoutMode` returns `overlay` regardless of what was
chosen, the mode picker disables itself and says why, and the choice is kept so it comes back when the
window grows. The breakpoint is exported as `mobileBreakpoint` so the resize listener and the media query
cannot disagree.

## Where the state lives

One `LayoutConfigState`, one `LayoutConfigProvider`, one `useLayoutConfig`. Every transition is a pure
function over the record (`layoutConfigTransitions.ts`), so the whole state machine is testable without
React, and exactly one function turns state into CSS (`layoutWrapperClasses`).

Preferences persist to `localStorage` under `cratis.scene.blueprint.default`: mode, menu theme, color
scheme, theme name and the pin. Deliberately *not* whether the sidebar happened to be open, whether the
pointer was over it, or whether the viewport was narrow - restoring those produces a shell that opens in a
state nobody chose. Everything read back is validated against the enums, because storage outlives the
version of the package that wrote it and an unknown mode puts a class on the wrapper that no rule matches.

## Token vocabulary

Thirteen tokens, matching `@cratis/scene.primereact`'s table exactly. A vocabulary that grows per package
is one no package can rely on.

`primary.color`, `primary.contrastColor`, `surface.background`, `surface.card`, `surface.border`,
`surface.hover`, `surface.overlay`, `text.color`, `text.mutedColor`, `highlight.background`,
`highlight.color`, `content.borderRadius`, `focus.ring`.

`layout.css` aliases the `--scene-*` custom properties into `--layout-*` locals once, at the top, and no
rule below references a `--scene-*` name - the same bridge pattern `@cratis/components` uses for its
`--cratis-*` layer. Overriding the look means overriding tokens, never editing a rule.

The stylesheet is a plain `.css` file rather than an import from TypeScript, because this repo's rollup
config has no CSS plugin and adding one is not this package's call. A host imports
`@cratis/scene.blueprint.default/styles` once; Storybook does it in `.storybook/preview.ts`.

## Theme attribution

| Theme | Author | Link | License |
| --- | --- | --- | --- |
| Scene Default Light | Cratis | <https://cratis.io> | MIT |
| Scene Default Dark | Cratis | <https://cratis.io> | MIT |

Both palettes are original to Cratis - a neutral grey ramp with an indigo accent - not adopted from any
existing preset, which is why `author` says so rather than being left blank. A theme with empty
attribution reads as "nobody has checked", and once a palette is lifted without its credit nobody can tell
afterwards which of the two it was. Anything adopted later must fill `author`, `authorUrl` and `license`
from the source package's own LICENSE file, verified rather than assumed.

Both themes declare `compatibleWith: ['core', 'Cratis.Blueprint.Default', 'PrimeReact',
'Cratis.Components', 'Tailwind']`. `core` is on the list on purpose: `incompatiblePackages` has no implicit
exemption for it, so a theme omitting it is reported incompatible for `core` with every profile that lists
it - which is every profile.

## Component names borrowed from elsewhere

A screen template names components by their **bare** name, so `resolveComponentName` picks the package and
the template stays portable. `gallery/dependencyComponentNames.ts` lists every name the gallery borrows;
each was checked against the owning package's own manifest (`primeReactPackage.ts`,
`cratisComponentsPackage.ts`) rather than assumed, and a spec resolves all of them.

Two names a dashboard obviously wants - `chart` and `fileUpload` - are declared by *neither* package, so
the templates use what does exist (a table of monthly figures; an image beside a "Change photo" button)
rather than referencing something that would render as a red placeholder.

`menu`, `breadcrumb` and `sidebar` are declared by both PrimeReact and this blueprint. That is override
priority working as designed: this blueprint sits last in the profile's ascending-priority list, so its
shell versions win the bare names while PrimeReact's stay reachable as `PrimeReact.menu`.

## Previewing

`GalleryScreenPreview` boots one gallery screen through the real path - real `Screen`, real
`resolveComponentName`, real `SceneElementView`, real registry. Nothing in it is a preview-only code path.

It resolves against `galleryPreviewProfile` rather than `galleryProfile`. Same four packages, different
order: this package takes no npm dependency on PrimeReact's or Cratis Components' *bundles* (a blueprint
declares its dependencies in its manifest, not in its bundler graph), so a preview run from here has only
`core` and this blueprint implemented. Ranking `core` above the two libraries means `text`, `button` and
`card` resolve to something that exists. Names only the libraries declare still resolve to them, find no
implementation, and render as `UnresolvedComponent`'s dashed box - which is the honest outcome, not a
papered-over one. A host with all four bundles uses `galleryProfile` and sees the real widgets.

## PrimeReact 11

This shell is deliberately hand-rolled CSS **today**, because PrimeReact 10 has no app-shell primitive:
its `Sidebar` is an overlay drawer (v11 renames it `Drawer` for exactly that reason), and the docked, rail,
reveal and drawer behaviors have nowhere to come from but a stylesheet.

PrimeReact 11 introduces a first-class `Sidebar` for the app-shell role, with `variant`, `collapsible`,
`side`, `overlay` and `openOnHover` props and a `Sidebar.Layout` registry. A v11 port would collapse:

- the docked/off-canvas rules (`layout-static*`, `layout-overlay*`) into `variant` + `overlay`;
- the reveal and drawer hover machinery, and most of `isSidebarRevealed`, into `openOnHover`;
- the rail widths (`slim`, `slim-plus`, `compact`) into `collapsible` plus a width token;
- the wrapper-class plumbing in `layoutWrapperClasses` into `Sidebar.Layout`.

What would **not** collapse, and would stay this package's own: the mobile forcing at 991px, the
persistence, the menu-theme axis, and `horizontal` (a sidebar that stops being a sidebar is not a sidebar
variant). Studio pins `primereact` to `10.9.8` and `@cratis/components` hard-depends on it, so the port is
blocked on that pin, not on this package.

## Deliberately not built

- **No router.** `menuItem` and `breadcrumb` render hash routes (`#/Dashboard`) against a screen name. A
  host with a real router wraps the shell and rewrites them; hashes keep the gallery navigable with no
  router at all, which is what a preview needs.
- **No widget adapters.** Every widget a template places comes from PrimeReact or Cratis Components. A
  blueprint that shipped its own table would be a component library wearing a blueprint's manifest.
- **No layout-arrangement renderer.** The layouts' `FlowArrangement`s are evaluated by the real
  `evaluateFlowArrangement` in specs, but the shell positions its regions with CSS. Rendering an
  arrangement generically is Scene#4's job, layered on top rather than folded in here.
- **No `FreeformSlotArrangement`.** Both layouts reflow; neither has a fixed-position variant worth
  expressing as absolute placements.

## Known gaps outside this package

- **`yarn install` has not been run since the folder was renamed** from `layout.default`, so Yarn's
  workspace state still names the old path and `yarn build` / `yarn test` fail with
  `Package for @cratis/scene.blueprint.default@workspace:... not found in the project`. Run `yarn install`
  once; until then the gates run through `npx tsc -b`, `npx rollup -c ./rollup.config.mjs`, `npx vitest run`,
  `npx eslint --cache --quiet .` and `npx storybook build`, which are what the `g:*` scripts invoke.
- `Source/JavaScript/blueprint.default` is not in the root `tsconfig.json` `references` (which now lists
  `tailwind`, `primereact` and `components`), so a root `npx tsc -b` does not build it.
- `FlowRow`, `FlowColumn` and a `FlowGrid` with no `columns` are structurally identical in `Scene.Model`,
  so a consumer cannot tell a row from a column by value. The builders in `layouts/flowBuilders.ts` keep
  the *intent* legible at the declaration site, and `grid()` always sets `columns`, but the model gap is
  real.

## Gates

```bash
npx tsc -b            # from the repository root
yarn build            # from this package
yarn test
yarn lint:ci
yarn build-storybook
```
