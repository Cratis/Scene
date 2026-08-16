---
title: Use the default blueprint
description: Render a screen inside the application shell, switch its layout mode, and switch its theme - in about ten minutes.
---

By the end of this you will have the Cratis default blueprint rendering a real screen in a real
application shell, with a working menu, a configurator that switches between eight layout modes, and a
theme that swaps live without a reload.

You need a React application, `@cratis/scene.react`, and the blueprint itself.

## Install and load the stylesheet

The blueprint's shell is hand-written CSS - it predates any application-shell primitive to lean on -
so the stylesheet has to be loaded once, at your entry point, along with PrimeReact's own.

```ts
import 'primeicons/primeicons.css';
import 'primeicons/primeicons.css';
import '@cratis/scene.blueprint.default/styles';
```

Load it once and never again. Every mode, every rail width and every transition in the shell comes from
this file; without it you get an unstyled column of regions and no clue why.

## Boot a gallery screen

The fastest way to see the whole thing working is to render one of the screens the blueprint already
ships. They are real `Screen` instances - not pictures - so this is the actual rendering path, not a demo
one.

```tsx
import { GalleryScreenPreview } from '@cratis/scene.blueprint.default';

export function App() {
    return <GalleryScreenPreview screenName='Dashboard' />;
}
```

Open it. You have a fixed topbar, a docked sidebar with three menu sections, a breadcrumb, a dashboard of
four stat cards over two columns of widgets, a footer, and a cog button floating against the right edge.

What happened under the hood: `composeScreenElement` turned the screen into an `ExternalComponent` tree
whose slots are the layout's slots, `resolveComponentName` decided which package owns each bare component
name, and the real `SceneElementView` rendered the result against the real registry. Nothing on that path
exists only for previews.

:::note
Widgets whose names belong to packages you have not loaded render as a dashed red box naming what is
missing. That is deliberate - a blueprint previewed against half a profile should look visibly incomplete
rather than quietly wrong.
:::

## Switch the layout mode

Click the cog. The configurator has four axes; the second is **Menu mode**. Click **Slim** and the sidebar
becomes a 5rem rail of circular icons with the content sliding in behind it. Click **Horizontal** and the
sidebar stops being a sidebar - it flows into the topbar as a row, and submenus drop down instead of
popping out sideways.

Nothing about the screen changed. The only thing that changed is one class on the wrapper element, which
is the whole point of the mode vocabulary: a screen cannot be written for one mode and broken in another.

To start in a particular mode rather than clicking to it:

```tsx
import { GalleryScreenPreview, LayoutMode } from '@cratis/scene.blueprint.default';

<GalleryScreenPreview screenName='Dashboard' initialConfig={{ mode: LayoutMode.Drawer }} />;
```

Now narrow the browser window past 991px. Every mode collapses to off-canvas, the mask appears behind the
sidebar, and the mode buttons grey out with a sentence saying why. Widen it again and your chosen mode is
back - it was kept, not overwritten.

## Switch the theme

Still in the configurator, the **Theme** section offers the two themes the blueprint ships. Click
**Scene Default Dark**.

The page changes color and nothing remounts. `SceneThemeProvider` writes the new token values onto the
element that is already there, so scroll position, an open menu, and anything typed into a form all
survive. That is what "live re-resolution" means, and it is why theme switching is fast enough to be a
thing people actually do rather than a thing they do once.

## Render your own screen instead

The gallery is a starting point, not the destination. A screen of your own names the layout, names the
template whose shape it fills, and provides the content:

```ts
import { Screen } from '@cratis/scene.model';
import { LayoutName } from '@cratis/scene.blueprint.default';

const invoices: Screen = {
    name: 'Invoices',
    layout: LayoutName.AppShell,
    screenTemplate: 'CrudList',
    slotContent: {},
    forms: [],
    contributions: [],
};
```

Fill `slotContent` with the shell chrome and your content, keyed by the layout's slot names - `topbar`,
`sidebar`, `menu`, `breadcrumb`, `content`, `footer`, `configPanel`. The
[regions and slots reference](./regions-and-slots.md) lists all of them.

## Where to go next

- [Screen and dialog templates](./screen-templates.md) - the model behind what you just rendered, and how
  templates nest.
- [The template set](./template-set.md) - the other twenty-two shapes you did not have to build.
- [Ship your own blueprint](./ship-your-own-blueprint.md) - when the default one is not the look you want.
