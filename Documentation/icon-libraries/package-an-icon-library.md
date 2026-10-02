---
title: Package an icon library
description: Declare an icon library as a Scene package, ship its catalog and its React adapter, and let components depend on it.
---

An icon library is a [package](../index.md#packages) of kind `IconLibrary`. Everything a profile already does
with packages - select it, order it, check its version, show its license - works for it unchanged.

## Declare the package

```ts
import { PackageKind, ScenePackage } from '@cratis/scene.model';

export const lucideManifest: ScenePackage = {
    name: '@acme/scene.icons.lucide',
    version: '1.4.0',
    kind: PackageKind.IconLibrary,
    dependencies: [],
    components: [],
    layouts: [],
    screenTemplates: [],
    dialogTemplates: [],
    themes: [],
    displayName: 'Lucide',
    module: '@acme/scene.icons.lucide',
    license: 'ISC',
    licenseUrl: 'https://lucide.dev/license',
    iconLibrary: {
        variants: [],
        renderers: ['react'],
        attribution: 'Icons by Lucide contributors',
        attributionUrl: 'https://lucide.dev',
        iconCount: 1500,
    },
};
```

The package `name` is the library's identity: it is what every stored `IconReference.library` holds, so it
must not change once references exist.

`iconLibrary` carries only what a picker needs before loading anything:

| Field | Meaning |
| --- | --- |
| `variants` | The style variants the library offers (`outline`, `solid`), empty for a single style. |
| `renderers` | The renderers the library ships an adapter for, such as `react`. |
| `attribution`, `attributionUrl` | The credit line the license asks to be shown. |
| `iconCount` | How many icons the catalog holds. |

The icons themselves are **not** listed in the manifest. A library can ship thousands, and resolving a profile
must stay cheap.

## Ship the catalog

The catalog is an `IconEntry` per icon, loaded on demand through an `IconCatalogSource`:

```ts
import { IconCatalogSource } from '@cratis/scene.engine';

export const lucideCatalog: IconCatalogSource = {
    library: lucideManifest.name,
    loadEntries: async () => (await import('./catalog.json')).default,
};
```

```json
[
    { "key": "house", "name": "House", "categories": ["Buildings"], "aliases": ["home"] },
    { "key": "trash-2", "name": "Trash", "categories": ["Actions"], "tags": ["delete", "remove"] }
]
```

Keys are stable across versions for as long as the library ships the icon. An entry holds no SVG and no class
name, so the same catalog serves every renderer.

## Ship the adapter

An adapter loads the artwork for one reference at a time, so a screen pays only for the icons it shows:

```tsx
import { IconAdapter } from '@cratis/scene.react';

export const lucideAdapter: IconAdapter = {
    library: lucideManifest.name,
    loadGlyph: async ({ key }) => {
        const glyphs = await import('./glyphs');
        return glyphs[key];   // a component taking { size, color, className }; undefined when there is no such icon
    },
};
```

## Publish the bundle

Export one bundle named after the package, and run `validatePackageBundle` in its specs like any other package:

```ts
import { ScenePackageBundle, validatePackageBundle } from '@cratis/scene.react';

export const lucidePackage: ScenePackageBundle = {
    manifest: lucideManifest,
    components: {},
    iconLibrary: { catalog: lucideCatalog, adapter: lucideAdapter },
};

validatePackageBundle(lucidePackage); // [] when manifest and bundle agree
```

The validation reports an icon-library manifest without `iconLibrary` metadata, a bundle without a catalog or
adapter, an adapter or catalog naming a different library, and a React adapter the manifest does not list
under `renderers`.

## Let components require the library

A component library, styling package or blueprint that draws icons declares a normal dependency:

```ts
dependencies: [{ name: '@acme/scene.icons.lucide', versionRange: '^1.0.0' }];
```

Resolving a profile that lists the component library then activates the icon library too, with the
component library recorded as the reason. A version outside the range surfaces as an `incompatible-version`
diagnostic.
