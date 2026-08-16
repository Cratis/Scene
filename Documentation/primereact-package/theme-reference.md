---
title: Theme reference
description: The 25 free PrimeTek themes the PrimeReact package ships, with their color scheme, author, source and license.
---

Every theme here is PrimeTek's work, shipped under the MIT license that covers the whole `primereact`
package, and **none of them are ours**. `Theme`'s `author`, `authorUrl` and `license` fields exist so that
stays visible wherever a theme is listed — show them in any picker you build.

## Attribution

Verified in `node_modules/primereact/LICENSE.md`: *"The MIT License (MIT), Copyright (c) 2016-2025
PrimeTek"*. The `primereact` package's own `package.json` reports `"license": "MIT"`.

| Theme | Scheme | Description | Author | Source | License |
| --- | --- | --- | --- | --- | --- |
| `lara-light-blue` | Light | The PrimeReact default: a clean, roomy light theme on a blue accent. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `lara-dark-blue` | Dark | The Lara family in dark, on a blue accent. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `lara-light-indigo` | Light | Lara light with an indigo accent. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `lara-dark-indigo` | Dark | Lara dark with an indigo accent. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `lara-light-purple` | Light | Lara light with a purple accent. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `lara-dark-purple` | Dark | Lara dark with a purple accent. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `lara-light-teal` | Light | Lara light with a teal accent. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `lara-dark-teal` | Dark | Lara dark with a teal accent. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `saga-blue` | Light | PrimeTek's earlier light theme: tighter spacing and smaller radii than Lara. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `vela-blue` | Dark | Saga's dark counterpart, on a desaturated blue-grey ground. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `arya-blue` | Dark | Saga's near-black dark counterpart, for high-contrast dark surfaces. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `bootstrap4-light-blue` | Light | PrimeTek's interpretation of the Bootstrap 4 look, in light. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `bootstrap4-dark-blue` | Dark | PrimeTek's interpretation of the Bootstrap 4 look, in dark. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `soho-light` | Light | A soft, low-contrast light theme on a violet accent. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `soho-dark` | Dark | Soho in dark, on the same violet accent. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `viva-light` | Light | A neutral, understated light theme on a muted indigo accent. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `viva-dark` | Dark | Viva in dark, on a near-black blue-grey ground. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `md-light-indigo` | Light | PrimeTek's interpretation of Material Design, in light on indigo. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `md-dark-indigo` | Dark | PrimeTek's interpretation of Material Design, in dark on indigo. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `mdc-light-indigo` | Light | The Material interpretation with compact density, in light. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `mdc-dark-indigo` | Dark | The Material interpretation with compact density, in dark. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `nano` | Light | A dense, near-square theme for information-heavy screens. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `mira` | Light | A calm light theme on a Nord-inspired blue-grey palette. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `fluent-light` | Light | PrimeTek's interpretation of the Microsoft Fluent look, in light. | PrimeTek | [primereact.org](https://primereact.org) | MIT |
| `tailwind-light` | Light | PrimeTek's interpretation of the Tailwind UI look, in light. | PrimeTek | [primereact.org](https://primereact.org) | MIT |

Several of these are PrimeTek's interpretation of someone else's design language — Bootstrap, Material
Design, Fluent, Tailwind UI. The compiled CSS is still PrimeTek's own work, so PrimeTek is still the author;
the lineage is recorded in the description rather than by misattributing the file.

## Where a theme's values come from

Token values are read verbatim from each theme's own `theme.css` `:root` block, so a Scene token always
agrees with what the PrimeReact stylesheet actually renders. That fidelity is the point of the bridge, and
it is kept even where a theme's own values are odd: `lara-light-teal` really does ship the same color for
`--highlight-bg` and `--highlight-text-color`, and mirroring it keeps the token layer honest about what the
component skin will do.

> [!NOTE]
> There is exactly one deliberate deviation. PrimeReact 10.9.8 ships `viva-dark` with an unresolved SCSS
> expression, `rgba($primaryColor, 0.08)`, for `--surface-hover`. That is not valid CSS and resolves to
> nothing at all, so it cannot be mirrored; the intended value — the theme's primary color at 8% — is used
> instead.

A theme's `isDark` is taken from this catalog rather than parsed from the stylesheet's `color-scheme`
declaration, because that declaration is not a reliable signal: `vela-blue` declares `color-scheme: light
dark` although every surface it defines is dark.

## Tokens

Every theme carries the same thirteen tokens, and only those thirteen — see
[Understanding design tokens](./understanding-design-tokens.md) for what each one means.

```ts
import { primeReactTheme } from '@cratis/scene.primereact';

primeReactTheme('lara-light-blue')!.tokens;
// {
//   'primary.color': '#3b82f6',
//   'primary.contrastColor': '#ffffff',
//   'surface.background': '#f9fafb',
//   'surface.card': '#ffffff',
//   'surface.border': '#dfe7ef',
//   'surface.hover': '#f6f9fc',
//   'surface.overlay': '#ffffff',
//   'text.color': '#4b5563',
//   'text.mutedColor': '#6b7280',
//   'highlight.background': '#eff6ff',
//   'highlight.color': '#1d4ed8',
//   'content.borderRadius': '6px',
//   'focus.ring': '0 0 0 0.2rem #bfdbfe'
// }
```

## Compatibility

Every theme declares `compatibleWith: ['PrimeReact', 'Tailwind', 'core']`.

`core` is listed deliberately, not by reflex. `ThemeCompatibility` has no implicit exemption for it, so a
theme that leaves it out is reported incompatible for every profile that lists `core` — which for a theme
that really does apply would be a false alarm on nearly every profile there is. And these themes do apply:
the compiled stylesheet only ever matches `.p-*` elements, but the semantic token layer
`SceneThemeProvider` writes reaches everything under the theme root, `core`'s unstyled primitives included.

## Stylesheet paths

```ts
import { primeReactThemeStylesheet } from '@cratis/scene.primereact';

primeReactThemeStylesheet('mira'); // 'primereact/resources/themes/mira/theme.css'
```

A theme's `name` **is** its folder under `primereact/resources/themes`, which is what makes this a direct
lookup rather than a table that could fall out of step with the files on disk. An unknown name returns
`undefined` rather than a plausible-looking path that would 404 at load time.

## Next

Wire a picker in [Switch themes live](./switch-themes-live.md).
