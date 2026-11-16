---
title: Theming through design-system anatomy
description: How a design system drives Cratis Components through a CSS variable bridge, without either side knowing the other exists.
---

A Scene design system declares **anatomy** for the components it is made of - the parts, variants and states of a `Card`, a `Menu`,
a `Button` - and nothing about CSS, because a non-DOM renderer has to be able to make an entirely different choice.

`@cratis/components` reads a `--cratis-*` CSS variable layer. It says nothing about Scene, because it was
written years before Scene existed and is used by applications that will never touch it.

This package connects the two with a stylesheet: Scene supplies the anatomy, and the bridge
makes it available through the variables the component library already reads. No rule in the bridge names a token of a
design system; it names only the anatomy of the components the library draws.

## Three layers, resolved in order

`@cratis/components` is built on React Aria. Its own `tokens.css` provides an indirection before any
PrimeReact variables; the fallbacks below serve compositions that opt into the optional PrimeReact
package. This lets the variable chain accommodate different PrimeReact major versions:

```css
--cratis-surface-card: var(--p-content-background, var(--surface-card));
/*                         ^ PrimeReact v11         ^ v10 legacy */
```

This package's bridge inserts the design system's anatomy in front of that chain:

```css
--cratis-surface-card: var(--ds-card-default-background, var(--p-content-background, var(--surface-card)));
/*                         ^ design-system anatomy       ^ PrimeReact v11         ^ v10 legacy */
```

That order determines which values a component sees:

- **The anatomy value is only a *first* preference.** Every mapping keeps the library's original fallback chain
  behind it. When a PrimeReact theme is active, a design system that gives a component fewer parts leaves the others
  to that theme's fallbacks rather than blanking them. The bridge does not load the fallback theme itself.
- **The rules are scoped to the themed element, never `:root`.** `applyDesign` writes onto the
  `SceneThemeProvider`'s element, so `--ds-*` does not exist at the document root. A `:root` rule would
  resolve every mapping to nothing and wipe out the PrimeReact fallbacks the bridge is supposed to preserve.
  The selector is `[data-scene-theme-root], [data-scene-theme]` - the provider sets the first, and a host
  calling `applyDesign` directly sets the second.
- **Only what the library draws is mapped.** `--cratis-primary-500`, `--cratis-green-500` and the rest
  of the primitive palette are left untouched. In a PrimeReact composition they keep resolving against its
  theme; the bridge does not invent anatomy or supply a missing palette.

## Using it

```typescript
import '@cratis/scene.components/styles';
```

After importing the bridge, wrap the tree in a `SceneThemeProvider` so `@cratis/components` components
underneath can read its values. This excerpt assumes the host has supplied the design, screen, registry
and optional binding resolver, along with its selected renderer setup:

```tsx
<SceneThemeProvider design={design}>
    <SceneElementView element={screen} registry={cratisComponents} resolveBinding={resolveBinding} />
</SceneThemeProvider>
```

Switching theme or mode rewrites the custom properties on the same element - no reload, no remount, and nothing
below it loses state.

## The anatomy it reads

The same anatomy `@cratis/scene.primereact` reads. One contract across both packages is the point: a design system
that declares these components drives Cratis Components without knowing it exists.

| Anatomy | CSS custom property | Maps onto |
|---|---|---|
| `Button` `primary` `background` | `--ds-button-primary-background` | `--cratis-primary-color` |
| `Button` `primary` `text` | `--ds-button-primary-text` | `--cratis-primary-color-text` |
| `Button` `primary` `shadow` in `focus` | `--ds-button-primary-shadow-focus` | `--cratis-focus-ring` |
| `Page` `default` `background` | `--ds-page-default-background` | `--cratis-surface-ground` |
| `Card` `default` `background` | `--ds-card-default-background` | `--cratis-surface-card`, `--cratis-surface-0` |
| `Card` `default` `border` | `--ds-card-default-border` | `--cratis-surface-border` |
| `Card` `default` `radius` | `--ds-card-default-radius` | `--cratis-border-radius` |
| `Menu` `default` `background` in `hover` | `--ds-menu-default-background-hover` | `--cratis-surface-hover`, `--cratis-surface-section`, `--cratis-surface-100` |
| `Menu` `default` `background` / `text` in `selected` | `--ds-menu-default-background-selected`, `--ds-menu-default-text-selected` | `--cratis-highlight-bg`, `--cratis-highlight-text-color` |
| `Popover` `default` `background` | `--ds-popover-default-background` | `--cratis-surface-overlay` |
| `Text` `default` `text` | `--ds-text-default-text` | `--cratis-text-color` |
| `Text` `muted` `text` | `--ds-text-muted-text` | `--cratis-text-color-secondary` |

`designAnatomyProperty` in `@cratis/scene.react` is the single place that decides how a component, variant, part and state
become a CSS custom property: each is kebab-cased and joined under the `--ds-` prefix. See
[Rendering the design system](../blueprints/design-system.md).

## A theme still has to be loaded

When the composition uses PrimeReact widgets, the bridge alone does not skin them. In PrimeReact 11,
a widget's *structural* CSS - padding, borders, the dialog frame, focus rings - comes from its theme,
not a separate primitives stylesheet. Without that styling, PrimeReact widgets render as raw HTML
primitives regardless of the anatomy a design system supplies. This styling requirement applies to PrimeReact widgets,
not every Scene profile.

For that composition, load a PrimeReact theme as well as the design. The
[PrimeReact package](../primereact-package/index.md) ships 24 themes built on PrimeTek's `@primeuix/themes` presets as Scene themes.
The anatomy layer and widget styling must agree; scoped Scene variables do not replace a theme's `:root`
values or its generated styles. Its [theme reference](../primereact-package/theme-reference.md) lists the
values each theme carries for the roles of the default design system.

## Where to go next

- [Component reference](components.md) - every name this package declares.
- [Naming and shadowing](naming-and-shadowing.md) - how a profile decides which package a name resolves to.
