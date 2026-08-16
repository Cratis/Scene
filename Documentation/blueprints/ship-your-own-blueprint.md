---
title: Ship your own blueprint
description: Build and publish a blueprint package - the manifest, the bundle, and the specs that stop the two from drifting apart.
---

You want your own application shape: your navigation, your page shapes, your palette. That is a blueprint,
and it is a package like any other.

This guide assumes you have built a React package before and know what a `ui profile` is. If you want to
understand *why* blueprints are a separate package kind first, read
[understanding blueprints](./understanding-blueprints.md).

## What you are producing

Two things, and the relationship between them is the whole discipline:

- a **`ScenePackage`** manifest - the declaration: a name, a kind, dependencies, and the *names* of
  everything you contribute;
- a **`ScenePackageBundle`** - the implementation: the real React components, layouts, templates, screens
  and themes behind those names.

The manifest is platform-agnostic and lives in the model, because design-time tooling reads it without ever
loading a component. The bundle is what a renderer needs.

## 1. Declare the manifest

```ts
import { PackageKind, ScenePackage } from '@cratis/scene.model';

export const myBlueprintManifest: ScenePackage = {
    name: 'Acme.Blueprint',
    version: '1.0.0',
    kind: PackageKind.Blueprint,
    dependencies: [{ name: 'PrimeReact' }, { name: 'Cratis.Components' }],
    components: ['appShell', 'topbar', 'menu'],
    layouts: ['AppShell'],
    screenTemplates: ['Dashboard'],
    dialogTemplates: ['ConfirmDialog'],
    themes: ['Acme Light'],
    displayName: 'Acme Blueprint',
    description: 'Acme\'s application shape.',
    module: '@acme/scene.blueprint',
};
```

`dependencies` is the part worth getting right. Your shells are built out of somebody else's widgets - say
so. A profile that activates your blueprint without them renders a shell whose every control is a dashed
red placeholder, and declaring the dependency is what lets that be reported while the profile is being
configured rather than discovered when someone opens the page.

`layouts` lists **only** application shells. A dashboard is a screen template, not a layout.

## 2. Register the components

Registry keys pair the package name with the bare name, and are always built rather than written:

```ts
import { ComponentRegistry, componentRegistryKey } from '@cratis/scene.react';

export const myBlueprintComponents: ComponentRegistry = {
    [componentRegistryKey('Acme.Blueprint', 'appShell')]: AppShell,
    [componentRegistryKey('Acme.Blueprint', 'topbar')]: Topbar,
    [componentRegistryKey('Acme.Blueprint', 'menu')]: Menu,
};
```

The separator is the registry's own business - deliberately not the `.` a screen uses to qualify a name, so
a package name containing dots stays unambiguous. Building a key by hand is how a component ends up
registered under something no lookup will ever produce.

Every component takes the same props:

```tsx
import { RegisteredComponentProps } from '@cratis/scene.react';

export function Menu({ element, slots }: RegisteredComponentProps) {
    return (
        <nav data-scene-id={element.id}>
            <ul className='layout-menu'>{slots.items}</ul>
        </nav>
    );
}
```

Read `element.properties` through typed accessors that fall back rather than casting. The bag carries
whatever a template author wrote and Scene never re-validates it, so a component that trusts it renders
`[object Object]` the first time a template has a typo.

## 3. Define the layouts

A layout is named slots plus an optional arrangement:

```ts
import { Layout } from '@cratis/scene.model';

export const appShellLayout: Layout = {
    name: 'AppShell',
    slots: [{ name: 'topbar' }, { name: 'menu' }, { name: 'content' }],
    arrangement: appShellArrangement,
};
```

Give the arrangement overrides for the size classes that change it, and let `evaluateFlowArrangement` pick.
An override targeting both axes beats one targeting a single axis, which is what makes a phone in landscape
get its own answer rather than whichever single-axis override happened to be declared last.

## 4. Define the templates

Every screen template names, in `fitsSlot`, the slot on its parent that it occupies:

```ts
import { ScreenTemplate } from '@cratis/scene.model';

export const dashboardTemplate: ScreenTemplate = {
    name: 'Dashboard',
    fitsSlot: 'content',
    slots: [{ name: 'stats' }, { name: 'primary' }, { name: 'secondary' }],
    content: {},
    displayName: 'Dashboard',
    description: 'Four stat cards over two columns of widgets.',
};
```

Dialog templates are the same minus `fitsSlot`, because a dialog is summoned rather than placed.

## 5. Assemble the bundle

```ts
import { ScenePackageBundle } from '@cratis/scene.react';

export const myBlueprint: ScenePackageBundle = {
    manifest: myBlueprintManifest,
    components: myBlueprintComponents,
    layouts: [appShellLayout],
    screenTemplates: [dashboardTemplate],
    dialogTemplates: [confirmDialogTemplate],
    screens: myGalleryScreens,
    themes: [acmeLight],
};
```

## 6. Prove the two halves agree

This is the step that is tempting to skip and expensive to skip.

```ts
import { validatePackageBundle } from '@cratis/scene.react';

describe('when validating the bundle', () => {
    const problems = validatePackageBundle(myBlueprint);

    it('should report no problems', () => {
        problems.should.be.empty;
    });
});
```

A manifest promising a component the bundle never registered renders as a dashed red box somewhere deep
inside a screen, a long way from the declaration that caused it. A component registered but not declared is
invisible to `resolveComponentName`, so no screen can ever name it. Both are silent, which is why every
blueprint runs this.

Three more checks are worth having, and each one caught something real while the default blueprint was
being built:

- **Every gallery screen fills only slots its layout declares.** Filling a slot the layout does not declare
  is a screen that renders empty with nothing to explain it.
- **Every component name a template references resolves** against a profile listing your dependencies. A
  name nothing declares is a placeholder in the middle of a page.
- **Every theme has `author`, `authorUrl` and `license` set**, and declares compatibility with every package
  the profile activates - `core` included, since there is no implicit exemption for it.

## 7. Ship a gallery

Ship real `Screen` instances alongside your templates, and boot them through the real engine.

This costs almost nothing and buys something specific: when a component name in a template is wrong, the
gallery is where it goes red - during *your* specs, rather than in somebody's application three weeks
later.

## Style it against the tokens

Reference the [thirteen shared tokens](./theme-tokens.md), aliased once into locals of your own, and never
a component library's variables directly. That indirection is what lets one blueprint work across
PrimeReact versions and lets a host override the look without editing your rules.

## Next

- [Composing screens from templates](./composing-screens.md) - the placement rules in full, including the
  one that fails silently.
- [Layout modes](./layout-modes.md) - what the default blueprint implements, if you want the same
  vocabulary.
