---
title: Switch themes live
description: Wire a theme picker that swaps the PrimeReact preset and the Scene tokens together, with no reload and no lost state.
---

This guide wires a theme picker that changes the whole appearance of a rendered Scene screen without a
reload, without remounting the subtree, and without losing what the user has typed.

## Before you start

You need a React application already rendering Scene screens through `SceneElementView` with the
`primeReactComponents` registry.

> [!IMPORTANT]
> PrimeReact 11 requires a PrimeUI license key. Without one every page shows an *"Invalid PrimeUI
> License"* banner, in development and production alike — this is not specific to theming, it is checked
> whenever `PrimeReactProvider` mounts. See [the licensing
> section](./primereact-11-migration.md#licensing).

## Load the stylesheets

There is far less to load than there was on PrimeReact 10. **v11 ships no CSS at all** — there is no
`primereact/resources` directory, so there is no structural stylesheet and no compiled theme to import.
What remains is the icon font and the Scene token bridge:

```ts
import 'primeicons/primeicons.css';
import '@cratis/scene.primereact/primeReactTheme.css';
```

The `<link id="theme-link">` arrangement PrimeReact 10 used is gone with the stylesheets it pointed at. A
theme is no longer a file that can be served from a path you choose; it is an object you hand to a
provider.

## Wire the two halves

Theming a Scene screen still takes two pieces, but the first one changed completely.

`usePrimeReactTheme` resolves a Scene `Theme` to the configuration `PrimeReactProvider` needs — a
`@primeuix/themes` preset plus its dark-mode selector. That is what makes `@primeuix/styled` emit the
`--p-*` custom properties PrimeReact's own components read.

`SceneThemeProvider` writes the same theme's semantic tokens onto the wrapping element, which is what
reaches this package's own wrappers, `core`'s primitives, and any layout CSS reading `--scene-*`.

```tsx
import { useState } from 'react';
import { PrimeReactProvider } from '@primereact/core';
import { SceneThemeProvider } from '@cratis/scene.react';
import { primeReactTheme, primeReactThemes, usePrimeReactTheme } from '@cratis/scene.primereact';

export const ThemedScreen = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState(primeReactTheme('lara-light-blue'));
    const configuration = usePrimeReactTheme(theme);

    return (
        <PrimeReactProvider value={configuration}>
            <SceneThemeProvider theme={theme}>
                <select value={theme?.name} onChange={(event) => setTheme(primeReactTheme(event.target.value))}>
                    {primeReactThemes.map((candidate) => (
                        <option key={candidate.name} value={candidate.name}>
                            {candidate.name}
                        </option>
                    ))}
                </select>
                {children}
            </SceneThemeProvider>
        </PrimeReactProvider>
    );
};
```

Switching is live: nothing reloads, nothing below the provider remounts, and no state is lost.

## Why this got simpler

On PrimeReact 10 this page had to explain a `<link>` element, an element id, why the swap created a
*replacement* element rather than assigning to `href` (some browsers will not re-fetch a mutated `href`),
and how to keep the application in charge of where theme files were served from.

None of that survives, because none of it has anything to swap any more:

| PrimeReact 10 | PrimeReact 11 |
| --- | --- |
| `applyPrimeReactTheme(name)` swapped a `<link>` | Removed — there is no stylesheet |
| `primeReactThemeStylesheet(name)` returned a CSS path | `primeReactThemePreset(name)` returns a preset object |
| A theme could 404 | A theme cannot 404 — it is a value, not a fetch |
| Switching could flash unstyled while the new sheet loaded | No fetch, so no flash |

`usePrimeReactTheme` kept its name because it kept its job — keep PrimeReact's half of the theme in step
with the Scene theme — but it returns a value now instead of performing a DOM side effect.

## Dark themes

`@primeuix/themes` resolves every `light-dark()` token pair against a CSS selector rather than the
operating system preference, so something has to put that selector on the page. `usePrimeReactTheme` hands
the preset `.scene-dark` as its `darkModeSelector`; add that class to an ancestor when the active theme is
a dark one:

```tsx
<div className={theme?.isDark ? 'scene-dark' : undefined}>
```

Every theme in the catalog reports `isDark`, so a picker can do this without a lookup table.

## Themes from another package

`usePrimeReactTheme` returns `undefined` for a theme this package does not ship, rather than falling back
to a default preset. That is deliberate: silently theming a screen as something other than what was asked
for is much harder to notice than nothing happening. A profile mixing in a theme from another package
leaves PrimeReact's own styling to whichever package owns that theme.

## See also

- [Theme reference](./theme-reference.md) — the 24 themes, their preset families and the attribution table.
- [Understanding design tokens](./understanding-design-tokens.md) — what the thirteen Scene tokens mean and
  how the bridge resolves them.
