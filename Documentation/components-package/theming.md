---
title: Theming through design tokens
description: How a Scene theme drives Cratis Components through a CSS variable bridge, without either side knowing the other exists.
---

A Scene theme is a bag of semantic tokens — `surface.card`, `text.color`, `primary.color`. It says nothing
about CSS, because a non-DOM renderer has to be able to make an entirely different choice.

`@cratis/components` reads a `--cratis-*` CSS variable layer. It says nothing about Scene, because it was
written years before Scene existed and is used by applications that will never touch it.

Neither side can learn about the other without one of them losing what makes it useful. So a stylesheet in
this package joins them, and both stay ignorant.

## Three layers, resolved in order

`@cratis/components` never references PrimeReact's variables directly. Its own `tokens.css` puts one
indirection in front of them, so a single build spans PrimeReact major versions:

```css
--cratis-surface-card: var(--p-content-background, var(--surface-card));
/*                         ^ PrimeReact v11         ^ v10 legacy */
```

This package's bridge inserts Scene in front of that chain:

```css
--cratis-surface-card: var(--scene-surface-card, var(--p-content-background, var(--surface-card)));
/*                         ^ Scene theme           ^ PrimeReact v11         ^ v10 legacy */
```

Three consequences, each a decision rather than a side effect:

- **The Scene value is only a *first* preference.** Every mapping keeps the library's original fallback chain
  behind it, so a theme that defines eight of the thirteen tokens leaves the other five exactly as the active
  PrimeReact theme had them, rather than blanking them.
- **The rules are scoped to the themed element, never `:root`.** `applyThemeTokens` writes onto the
  `SceneThemeProvider`'s element, so `--scene-*` does not exist at the document root. A `:root` rule would
  resolve every mapping to nothing and wipe out the PrimeReact fallbacks the bridge is supposed to preserve.
  The selector is `[data-scene-theme-root], [data-scene-theme]` — the provider sets the first, and a host
  calling `applyThemeTokens` directly sets the second.
- **Only tokens Scene has a name for are mapped.** `--cratis-primary-500`, `--cratis-green-500` and the rest
  of the primitive palette are left untouched and keep resolving against the PrimeReact theme. Inventing
  Scene names for them would assert a vocabulary the themes on the other side do not have.

## Using it

```typescript
import '@cratis/scene.components/styles';
```

Then wrap the tree in a `SceneThemeProvider` with a theme, and every `@cratis/components` component
underneath follows it:

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

The bridge tints the surfaces the Cratis wrappers own. It does not, on its own, skin PrimeReact's widgets:
in PrimeReact 11 every widget's *structural* CSS — padding, borders, the dialog frame, focus rings — comes
inside the theme file, and there is no separate primitives stylesheet. An application that loads no
PrimeReact theme has no structural CSS, and its components render as raw HTML primitives whatever the tokens
say.

So load a PrimeReact theme underneath, and use Scene tokens to move it to your palette. The
[PrimeReact package](../primereact-package/index.md) ships 24 themes built on PrimeTek's `@primeuix/themes` presets as Scene themes,
with its tokens read verbatim out of the theme's own `:root` block — so the token layer always agrees with
what the stylesheet renders. Its [theme reference](../primereact-package/theme-reference.md) lists the
values each theme carries for the thirteen tokens above.

## Where to go next

- [Component reference](components.md) — every name this package declares.
- [Naming and shadowing](naming-and-shadowing.md) — how a profile decides which package a name resolves to.
