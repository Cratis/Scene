---
title: Switch themes live
description: Wire a theme picker that swaps the PrimeReact stylesheet and the Scene tokens together, with no reload and no lost state.
---

This guide wires a theme picker that changes the whole appearance of a rendered Scene screen without a
reload, without remounting the subtree, and without losing what the user has typed.

## Before you start

You need a React application already rendering Scene screens through `SceneElementView` with the
`primeReactComponents` registry, and PrimeReact's stylesheets loaded.

## Load the stylesheets in the right order

PrimeReact's structural CSS and one compiled theme come first; the token bridge comes after, because it
reads the theme's variables.

```ts
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.css';
import 'primeicons/primeicons.css';
import '@cratis/scene.primereact/primeReactTheme.css';
```

If your build serves the themes as static files rather than importing them, declare the initial theme as a
`<link>` in your HTML and give it the id `theme-link`:

```html
<link id="theme-link" rel="stylesheet" href="/assets/themes/lara-light-blue/theme.css">
```

Either works. The `<link>` form gives you control over where themes are served from, and the swap keeps
whatever path shape you wrote.

## Wire the two halves

A PrimeReact 10 theme is a pre-compiled CSS file, so there is nothing to *set* — only a different file to
load. That is why theming takes two pieces: `usePrimeReactTheme` swaps the stylesheet that skins PrimeReact's
components, and `SceneThemeProvider` writes the same theme's semantic tokens onto the wrapping element,
which is what reaches this package's own wrappers, `core`'s primitives, and any layout CSS reading
`--scene-*`.

```tsx
import { useState } from 'react';
import { SceneElement, Theme } from '@cratis/scene.model';
import { SceneElementView, SceneThemeProvider } from '@cratis/scene.react';
import { primeReactComponents, primeReactThemes, usePrimeReactTheme } from '@cratis/scene.primereact';

export const ThemedScreen = ({ element }: { element: SceneElement }) => {
    const [theme, setTheme] = useState<Theme>(primeReactThemes[0]);
    usePrimeReactTheme(theme);

    return (
        <>
            <select
                aria-label='Theme'
                value={theme.name}
                onChange={(event) =>
                    setTheme(primeReactThemes.find((candidate) => candidate.name === event.target.value) ?? primeReactThemes[0])
                }>
                {primeReactThemes.map((candidate) => (
                    <option key={candidate.name} value={candidate.name}>
                        {candidate.name}
                        {candidate.isDark ? ' (dark)' : ''}
                    </option>
                ))}
            </select>
            <SceneThemeProvider theme={theme}>
                <SceneElementView element={element} registry={primeReactComponents} resolveBinding={() => undefined} />
            </SceneThemeProvider>
        </>
    );
};
```

Drop the hook and PrimeReact's components keep the old skin. Drop the provider and the wrappers around them
do not follow. Both, and the whole screen moves together.

## What the swap actually does

`usePrimeReactTheme` follows the mechanism PrimeReact 10.9.8 implements in `PrimeReactContext.changeTheme`:
find the `<link>` by id, build a new URL, create a **replacement** `<link>` element, and swap it into the
same position. Creating a new element rather than assigning to `href` matters — some browsers do not
reliably re-fetch a stylesheet whose `href` is mutated in place.

Two things differ from PrimeReact's own implementation, both deliberately:

| PrimeReact 10.9.8 | This package |
| --- | --- |
| String-replaces the old theme name anywhere in the URL | Replaces the theme *folder segment*, so an application served from `/nano/` can leave the `nano` theme without corrupting its own path |
| Throws when the `<link>` is missing | Creates it, because a host embedding a preview has no reason to have pre-declared one |

## Group the picker by scheme

Every theme says whether it is dark, so a picker can group rather than making the reader guess from the name:

```tsx
import { primeReactThemes } from '@cratis/scene.primereact';

const light = primeReactThemes.filter((theme) => !theme.isDark);
const dark = primeReactThemes.filter((theme) => theme.isDark);
```

## Credit the author in the picker

Every theme in this package is PrimeTek's work, and the `Theme` fields carry the attribution so a picker can
show it:

```tsx
<a href={theme.authorUrl} target='_blank' rel='noreferrer'>
    {theme.author}
</a>{' '}
&middot; {theme.license}
```

Do this. It is one line, the data is already there, and it is the difference between using someone's work
and passing it off as your own. The full table is in [Theme reference](./theme-reference.md).

## Switch to a theme by name

When the theme comes from configuration rather than a picker, look it up — an unknown name returns
`undefined` rather than a plausible-looking value:

```ts
import { primeReactTheme, primeReactThemeStylesheet } from '@cratis/scene.primereact';

primeReactTheme('soho-dark');                    // the Theme
primeReactThemeStylesheet('soho-dark');          // 'primereact/resources/themes/soho-dark/theme.css'
primeReactThemeStylesheet('lara-light-chartreuse'); // undefined
```

## Swap outside React

`applyPrimeReactTheme` is the same operation without the hook, for a theme chosen before React mounts or by
code that is not a component:

```ts
import { applyPrimeReactTheme } from '@cratis/scene.primereact';

applyPrimeReactTheme('lara-dark-teal'); // true when it swapped, false when the theme is unknown
```

## Next

Look up what a name maps to in the [Component reference](./component-reference.md), or see every theme in
the [Theme reference](./theme-reference.md).
