---
title: Migrating to PrimeReact 11
description: The renames, removals and hook conversions PrimeReact 11 brings, and what each one means for the abstract names this package declares.
---

This package targets PrimeReact **10.9.8** and must keep doing so: Cratis Studio pins `primereact` to
`10.9.8` through a root `resolutions` entry, and `@cratis/components` depends on exactly that version.
Import from `primereact/*` only — never `@primereact/*` or `@primeuix/themes`.

PrimeReact 11 exists, and the port will happen eventually. This page records what changes so it is a known
quantity rather than a discovery.

## The trap, first

> [!CAUTION]
> **`Sidebar` is not `Sidebar`.** PrimeReact 10's `Sidebar` — a panel that slides in from an edge of the
> viewport — becomes `Drawer` in v11. Separately, v11 introduces a **brand-new, unrelated `Sidebar`** for
> application-shell navigation.
>
> A port that follows the name rather than the behavior silently swaps a slide-in overlay for a static
> shell element. **It will compile.** Nothing fails until someone opens the screen.

The abstract name this package declares is `sidebar`, and it means the overlay. When the port happens, it
maps to v11's `Drawer`.

## Renames

Each of these is a one-line import change in a single adapter file. The abstract name does not move — that
is the point of having one.

| Abstract name | PrimeReact 10 | PrimeReact 11 |
| --- | --- | --- |
| `dropdown` | `Dropdown` | `Select` |
| `calendar` | `Calendar` | `DatePicker` |
| `overlayPanel` | `OverlayPanel` | `Popover` |
| `sidebar` | `Sidebar` | `Drawer` |
| `toggleSwitch` | `InputSwitch` | `ToggleSwitch` |
| `tabView` | `TabView` + `TabPanel` | `Tabs` |
| `inputTextarea` | `InputTextarea` | `Textarea` |
| `password` | `Password` | `InputPassword` |
| `chips` | `Chips` | `InputTags` |
| `colorPicker` | `ColorPicker` | `InputColor` |
| `galleria` | `Galleria` | `Gallery` |
| `scrollPanel` | `ScrollPanel` | `ScrollArea` |
| `selectButton` | `SelectButton` | `ToggleButtonGroup` |

Note how many of the abstract names already match the v11 name — `toggleSwitch`, `selectButton`. That is
not luck. A Scene name follows what a component *is*, not what one library calls it this major version, so
the abstract vocabulary tends to survive a rename that the library's own does not.

`tabView` is the one rename that is more than an import: `TabView` + `TabPanel` collapse into a single
`Tabs` component, so the header/content pairing in `panel/PrimeTabView.tsx` has to be rebuilt against the
new shape.

## Became hooks

These stop being components in v11 and become hooks. Each needs a rewrite, not a rename.

| Abstract name | PrimeReact 10 component |
| --- | --- |
| `inputMask` | `InputMask` |
| `scrollTop` | `ScrollTop` |
| `orderList` | `OrderList` |
| `pickList` | `PickList` |

`KeyFilter` is on the same list upstream but this package does not map it, so it costs nothing.

## Removed

v11 removes these outright. Four are mapped here, and each needs either a replacement built from what
remains or the abstract name retired from the manifest.

| Abstract name | PrimeReact 10 component | Status |
| --- | --- | --- |
| `blockUI` | `BlockUI` | Mapped — needs a replacement |
| `panelMenu` | `PanelMenu` | Mapped — needs a replacement |
| `tabMenu` | `TabMenu` | Mapped — navigation tabs are built from `Tabs` in v11 |
| `dock` | `Dock` | Mapped — needs a replacement |

Also removed upstream, and not mapped here, so no cost: `ConfirmPopup`, `DeferredContent`, `DataScroller`,
`TriStateCheckbox`, `MultiStateCheckbox`, `SlideMenu`, `Mention` and `Ripple`.

`ConfirmDialog` survives — only its `ConfirmPopup` sibling goes — so `confirmDialog` is unaffected.

## Moved to commercial packages

`Chart` and `Editor` move to the commercial `@primeuipro/*` packages and have **no React release yet**.

This package maps neither of them, and the reasoning that kept them out for v10 holds for v11 as well:
`chart` would drag in Chart.js and `editor` would drag in Quill, and neither belongs in a package whose job
is mapping names. See the [Component reference](./component-reference.md#deliberately-not-covered).

## Icons

v11 components ship **no icons**. Every `icon` property this package passes through assumes `primeicons` is
loaded, which stays true in v11 — but v11's own components no longer bundle their internal ones, so any
component that relied on a built-in icon needs one supplied.

## Themes

PrimeReact 11 replaces the compiled per-theme CSS files with `@primeuix/themes`, a runtime design-token
system. That is a larger change than the component renames, and it changes the shape of theming rather than
its names:

- `primeReactThemeStylesheet` and `applyPrimeReactTheme` become meaningless — there is no stylesheet to
  swap.
- `usePrimeReactTheme` would set design tokens directly instead of replacing a `<link>`.
- The Scene token vocabulary and `SceneThemeProvider` are **unaffected**. That is exactly what the
  indirection was for: the thirteen tokens in
  [Understanding design tokens](./understanding-design-tokens.md) stay the same, and only the bridge file
  underneath them is rewritten.
- Attribution stays required either way — see [Theme reference](./theme-reference.md).

## Checklist for the port

1. Bump `primereact` and its peer range, and confirm Studio's `resolutions` entry moved with it.
2. Apply the 13 renames — 12 are import-only; rebuild `tabView` against `Tabs`.
3. Rewrite the 4 hook conversions.
4. Decide, for each of the 4 removals, whether to rebuild or to retire the abstract name.
5. Rewrite `theme/` against `@primeuix/themes`, keeping the token vocabulary and the attribution.
6. Check every `icon` property still resolves, now that v11 ships none.
7. Re-run the specs: `validatePackageBundle` proves the manifest and registry still agree, and the
   attribution specs prove no credit was dropped along the way.
