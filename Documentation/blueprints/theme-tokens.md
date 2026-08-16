---
title: Theme tokens
description: The thirteen semantic tokens every Scene package agrees on, how they become CSS, and the attribution of every theme the default blueprint ships.
---

A Scene `Theme` is a set of semantic tokens - `primary.color`, `surface.card` - and nothing platform
specific. A renderer decides what a token becomes: the React renderer turns each into a CSS custom
property, and a future native renderer could turn it into something else entirely.

## The vocabulary

Thirteen tokens, shared by every Scene package. A vocabulary that grows per package is one no package can
rely on.

| Token | CSS custom property | Used for |
| --- | --- | --- |
| `primary.color` | `--scene-primary-color` | brand accent, active states, primary buttons |
| `primary.contrastColor` | `--scene-primary-contrast-color` | text and icons on the primary color |
| `surface.background` | `--scene-surface-background` | the page canvas behind everything |
| `surface.card` | `--scene-surface-card` | topbar, sidebar, cards, panels |
| `surface.border` | `--scene-surface-border` | every divider and outline |
| `surface.hover` | `--scene-surface-hover` | hover states on menu items and buttons |
| `surface.overlay` | `--scene-surface-overlay` | floating submenus and popups |
| `text.color` | `--scene-text-color` | body text |
| `text.mutedColor` | `--scene-text-muted-color` | secondary text, footer, section titles |
| `highlight.background` | `--scene-highlight-background` | the current menu item's background |
| `highlight.color` | `--scene-highlight-color` | the current menu item's text |
| `content.borderRadius` | `--scene-content-border-radius` | every rounded corner |
| `focus.ring` | `--scene-focus-ring` | the keyboard focus indicator |

The name-to-property rule lives in one place, `themeTokenProperty`: dots become dashes and camelCase
splits, so `text.mutedColor` becomes `--scene-text-muted-color`.

## The bridge

The blueprint's stylesheet aliases those custom properties into `--layout-*` locals exactly once, at the
top, and no rule below references a `--scene-*` name:

```css
.layout-wrapper,
.layout-full-page {
    --layout-primary: var(--scene-primary-color, #4f46e5);
    --layout-primary-contrast: var(--scene-primary-contrast-color, #ffffff);
    --layout-background: var(--scene-surface-background, #f4f5f7);
    --layout-card: var(--scene-surface-card, #ffffff);
    --layout-border: var(--scene-surface-border, #e2e5e9);
    --layout-hover: var(--scene-surface-hover, #eceef1);
    --layout-overlay: var(--scene-surface-overlay, #ffffff);
    --layout-text: var(--scene-text-color, #1f2430);
    --layout-text-muted: var(--scene-text-muted-color, #6b7280);
    --layout-highlight: var(--scene-highlight-background, #eef2ff);
    --layout-highlight-text: var(--scene-highlight-color, #3730a3);
    --layout-radius: var(--scene-content-border-radius, 0.5rem);
    --layout-focus-ring: var(--scene-focus-ring, 0 0 0 2px rgb(79 70 229 / 0.4));
}
```

That single seam is what makes the shell theme-agnostic. Swap the theme and every mode restyles; take over
the look by overriding tokens rather than editing a rule. The fallbacks are neutral greys so an unthemed
shell is legible rather than invisible - they are a safety net, not a palette.

## Applying a theme

`LayoutThemeProvider` resolves whichever theme the shell's configuration currently names and hands it to
`SceneThemeProvider`:

```tsx
import { LayoutConfigProvider, LayoutThemeProvider } from '@cratis/scene.blueprint.default';

<LayoutConfigProvider>
    <LayoutThemeProvider>{/* the shell */}</LayoutThemeProvider>
</LayoutConfigProvider>;
```

Pass your own `themes` to offer brand palettes instead of the shipped two. The configurator only ever
records a *name*, so substituting the theme set changes nothing about the switcher.

Switching is live re-resolution rather than a reload: the new token values are written onto the element
that is already there, so nothing below it remounts and no state is lost.

## Theme attribution

The `Theme` record carries `author`, `authorUrl` and `license` for exactly this purpose, and a blueprint
must fill them in.

| Theme | Author | Link | License |
| --- | --- | --- | --- |
| Scene Default Light | Cratis | <https://cratis.io> | MIT |
| Scene Default Dark | Cratis | <https://cratis.io> | MIT |

Both palettes are original to Cratis - a neutral grey ramp with an indigo accent - rather than adopted from
an existing preset, which is why `author` says so rather than being left blank. A theme with empty
attribution reads as "nobody has checked", and once a palette is lifted from somewhere else without its
credit, nobody can tell afterwards which of the two it was.

:::important
If you adopt a palette from an existing free theme, fill `author`, `authorUrl` and `license` from the
source package's own LICENSE file. Verify it rather than assuming - "it's free" and "it's MIT" are not the
same claim.
:::

## Compatibility is declared, not assumed

A theme lists every package it is known to work with:

```ts
export const blueprintThemeCompatibility: string[] = ['core', defaultBlueprintName, 'PrimeReact', 'Cratis.Components', 'Tailwind'];
```

`core` is on that list on purpose. `incompatiblePackages` has **no implicit exemption** for it, so a theme
omitting it is reported incompatible for `core` with every profile that lists it - which is every profile,
since `core` is the fallback vocabulary. The exemption was left out of the engine deliberately, so that
"compatible with everything active" has to be stated rather than assumed.

An incompatible pairing is a warning rather than an error: the theme might still work by coincidence, but
the gap has to be visible.

## Both themes define the same tokens

Deliberately the same thirteen names in both, and nothing more. A dark theme that introduced extra tokens
would work only for the parts of the shell written after it existed. The token set is the contract, and
both themes filling it identically is what makes switching a swap rather than a re-render with holes in it.
