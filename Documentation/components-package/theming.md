---
title: Theming through design tokens
description: How a Scene theme drives Cratis Components through a CSS variable bridge, without either side knowing the other exists.
---

A Scene theme is a bag of semantic tokens — `surface.card`, `text.color`, `primary.color`. It says nothing
about CSS, because a non-DOM renderer has to be able to make an entirely different choice.

`@cratis/components` reads a `--cratis-*` CSS variable layer. It says nothing about Scene, because it was
written years before Scene existed and is used by applications that will never touch it.

This package connects the vocabularies with a stylesheet: Scene supplies semantic values, and the bridge
makes them available through the variables the component library already reads.

## Three layers, resolved in order

`@cratis/components` is built on React Aria. Its own `tokens.css` provides an indirection before any
PrimeReact variables; the fallbacks below serve compositions that opt into the optional PrimeReact
package. This lets the variable chain accommodate different PrimeReact major versions:

```css
--cratis-surface-card: var(--p-content-background, var(--surface-card));
/*                         ^ PrimeReact v11         ^ v10 legacy */
```

This package's bridge inserts Scene in front of that chain:

```css
--cratis-surface-card: var(--scene-surface-card, var(--p-content-background, var(--surface-card)));
/*                         ^ Scene theme           ^ PrimeReact v11         ^ v10 legacy */
```

That order determines which values a component sees:

- **The Scene value is only a *first* preference.** Every mapping keeps the library's original fallback chain
  behind it. When a PrimeReact theme is active, a Scene theme defining eight of the thirteen tokens leaves
  the other five to that theme's fallbacks rather than blanking them. The bridge does not load the fallback
  theme itself.
- **The rules are scoped to the themed element, never `:root`.** `applyThemeTokens` writes onto the
  `SceneThemeProvider`'s element, so `--scene-*` does not exist at the document root. A `:root` rule would
  resolve every mapping to nothing and wipe out the PrimeReact fallbacks the bridge is supposed to preserve.
  The selector is `[data-scene-theme-root], [data-scene-theme]` — the provider sets the first, and a host
  calling `applyThemeTokens` directly sets the second.
- **Only tokens Scene has a name for are mapped.** `--cratis-primary-500`, `--cratis-green-500` and the rest
  of the primitive palette are left untouched. In a PrimeReact composition they keep resolving against its
  theme; the bridge does not invent additional Scene token names or supply a missing palette.

## Using it

```typescript
import '@cratis/scene.components/styles';
```

After importing the bridge, wrap the tree in a `SceneThemeProvider` so `@cratis/components` components
underneath can read its values. This excerpt assumes the host has supplied the theme, screen, registry
and optional binding resolver, along with its selected renderer setup:

```tsx
<SceneThemeProvider theme={midnight}>
    <SceneElementView element={screen} registry={cratisComponents} resolveBinding={resolveBinding} />
</SceneThemeProvider>
```

Switching theme rewrites the custom properties on the same element — no reload, no remount, and nothing
below it loses state.

## The token vocabulary

Thirteen tokens, the same set `@cratis/scene.primereact` writes its themes in. One vocabulary across both
packages is the point: a theme shipped by the PrimeReact package drives Cratis Components without knowing it
exists.

| Scene token | CSS custom property | Maps onto |
|---|---|---|
| `primary.color` | `--scene-primary-color` | `--cratis-primary-color` |
| `primary.contrastColor` | `--scene-primary-contrast-color` | `--cratis-primary-color-text` |
| `surface.background` | `--scene-surface-background` | `--cratis-surface-ground` |
| `surface.card` | `--scene-surface-card` | `--cratis-surface-card`, `--cratis-surface-0` |
| `surface.border` | `--scene-surface-border` | `--cratis-surface-border` |
| `surface.hover` | `--scene-surface-hover` | `--cratis-surface-hover`, `--cratis-surface-section`, `--cratis-surface-100` |
| `surface.overlay` | `--scene-surface-overlay` | `--cratis-surface-overlay` |
| `text.color` | `--scene-text-color` | `--cratis-text-color` |
| `text.mutedColor` | `--scene-text-muted-color` | `--cratis-text-color-secondary` |
| `highlight.background` | `--scene-highlight-background` | `--cratis-highlight-bg` |
| `highlight.color` | `--scene-highlight-color` | `--cratis-highlight-text-color` |
| `content.borderRadius` | `--scene-content-border-radius` | `--cratis-border-radius` |
| `focus.ring` | `--scene-focus-ring` | `--cratis-focus-ring` |

`themeTokenProperty` in `@cratis/scene.react` is the single place that decides how a semantic name becomes a
CSS custom property: it splits on `.`, kebab-cases each part, and prefixes `--scene-`.

## A theme still has to be loaded

When the composition uses PrimeReact widgets, the bridge alone does not skin them. In PrimeReact 11,
a widget's *structural* CSS — padding, borders, the dialog frame, focus rings — comes from its theme,
not a separate primitives stylesheet. Without that styling, PrimeReact widgets render as raw HTML
primitives regardless of the Scene token values. This styling requirement applies to PrimeReact widgets,
not every Scene profile.

For that composition, load a PrimeReact theme as well as the Scene tokens. The
[PrimeReact package](../primereact-package/index.md) ships 24 themes built on PrimeTek's `@primeuix/themes` presets as Scene themes.
The token layer and widget styling must agree; scoped Scene variables do not replace a theme's `:root`
values or its generated styles. Its [theme reference](../primereact-package/theme-reference.md) lists the
values each theme carries for the thirteen tokens above.

## Where to go next

- [Component reference](components.md) — every name this package declares.
- [Naming and shadowing](naming-and-shadowing.md) — how a profile decides which package a name resolves to.
