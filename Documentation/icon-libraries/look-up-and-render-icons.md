---
title: Look up and render icons
description: Resolve the icon libraries a profile has, search their catalogs on demand, resolve a reference, and draw it with SceneIcon.
---

## Find the libraries a profile has

`resolveIconLibraries` runs the normal package resolver and keeps the icon libraries - the ones the profile
lists and the ones its other packages depend on:

```ts
import { resolveIconLibraries } from '@cratis/scene.engine';

const { libraries, diagnostics } = resolveIconLibraries(profile.packages, packageCatalog);

for (const library of libraries) {
    console.log(library.library, library.isSelected, library.requiredBy);
}
```

Each `ResolvedIconLibrary` carries its `ScenePackage` (version, license, attribution) and its provenance:
`isSelected` says whether the profile lists it, `requiredBy` names the active packages that depend on it.
Several libraries coexist; the order carries no precedence.

## Open the effective catalog

```ts
import { EffectiveIconCatalog } from '@cratis/scene.engine';

const icons = new EffectiveIconCatalog(resolveIconLibraries(profile.packages, packageCatalog), [lucideCatalog, primeCatalog]);
```

Opening it loads nothing. A catalog is read the first time something needs that library, once, and a query
narrowed to one library reads only that library:

```ts
const { entries, diagnostics } = await icons.search({ text: 'trash', library: '@acme/scene.icons.lucide' });
const categories = await icons.categories();
```

Each `EffectiveIconEntry` has the `entry`, the providing `library` and one `reference` per variant. A library
whose catalog failed to load appears in `diagnostics` as `catalog-unavailable` - an absent icon is never mistaken
for one that does not exist - and is retried on the next call.

## Resolve a reference

```ts
const resolution = await icons.resolve({ library: '@acme/scene.icons.lucide', key: 'house' });

if (!resolution.isResolved) {
    console.warn(resolution.diagnostic.kind, resolution.diagnostic.message);
}
```

| Diagnostic | Meaning |
| --- | --- |
| `missing-library` | The reference names a library the profile does not have. |
| `missing-icon` | The library has no icon with that key. |
| `missing-variant` | The icon exists, but not in the requested variant. A reference with no variant resolves to the library's default. |
| `incompatible-version` | The library is active at a version a dependent does not accept. |
| `catalog-unavailable` | The library's catalog could not be loaded. |

A reference is never answered with a different icon, even when another active library has the same key.

## Draw a reference

Register each library's adapter once and draw with `SceneIcon`:

```tsx
import { IconAdapterProvider, SceneIcon, createIconAdapterRegistry, mergeIconAdapters } from '@cratis/scene.react';

const adapters = mergeIconAdapters([lucidePackage, primePackage]); // or createIconAdapterRegistry([...])

<IconAdapterProvider registry={adapters}>
    <SceneIcon reference={{ library: '@acme/scene.icons.lucide', key: 'house' }} size={20} color="teal" label="Home" />
</IconAdapterProvider>;
```

| Prop | Behavior |
| --- | --- |
| `size` | Pixels or any CSS length; defaults to `1em`, so the icon scales with its text. |
| `color` | Defaults to `currentColor`. |
| `label` | The accessible name. With one the icon is announced as an image; without one it is decorative and hidden from assistive technology. |
| `fallback` | Shown when the icon cannot be drawn: no adapter for the library, no such icon, a failed load. |

Registering two adapters for one library throws, so an icon cannot render differently depending on registration
order. Artwork is loaded per icon, and each icon is loaded once however many places draw it.

## Know what a library change would break

See [Migrate existing icon values](migrate-existing-icon-values.md#preview-the-impact-of-a-library-change).
