---
title: Icons in editing
description: How icon values set through inspection and editing - template-instance overrides and collection-item icons - are validated against the effective icon catalog, and how missing or removed icons are reported without losing the stored values.
---

An `icon` property holds an [`IconReference`](understanding-icon-references.md). Editing already checks that the
value has the right shape and that the property is exposed to the template instance that sets it. Give the
editing context the profile's effective icon catalog and it also checks that the icon exists.

## Pass the catalog

`EditingContext.iconCatalog` is optional. Without it, icon values are checked for shape only, exactly as before.

```ts
import { EffectiveIconCatalog, applyEdit, inspect, resolveIconLibraries } from '@cratis/scene.engine';

const icons = new EffectiveIconCatalog(resolveIconLibraries(profile.packages, packageCatalog), sources);
await icons.load(); // read the catalogs now, because applyEdit and inspect are synchronous

const context = { catalog, scope, iconCatalog: icons };
```

`load()` reads every active library's catalog (or one library's, with `load(library)`) and returns the
libraries whose catalog could not be loaded. Until a library's catalog is loaded, an icon from it cannot be
confirmed: edits go ahead with an `iconNotVerified` warning. A library the profile does not have, or has at an
incompatible version, is known without a catalog and is reported regardless.

## What an edit checks

Setting an icon as an instance (`SetInstanceValueEdit`), adding a collection item with an icon field
(`AddCollectionItemEdit`) and changing one (`EditCollectionItemEdit`) all check the reference. A reference the
catalog cannot supply is an **error**: the edit is refused and the document is returned unchanged.

| Code | Meaning |
| --- | --- |
| `missingIconLibrary` | The profile has no library with that identity. |
| `missingIcon` | The library has no icon with that key. |
| `missingIconVariant` | The icon exists, but not in that variant. |
| `incompatibleIconLibrary` | The library is active at a version a dependent does not accept. |
| `iconCatalogUnavailable` | The library's catalog could not be loaded. |
| `iconNotVerified` | The library's catalog is not loaded yet (warning; the edit goes ahead). |

The same icon key from two libraries is two icons. Both are accepted, each stored with its own library, and
neither is substituted for the other.

## Instances stay independent

Each template instance keeps its own contribution, keyed by instance, component and property. Two screens that
fill one template can choose different icons, from different libraries, for the same exposed property; resetting
one leaves the other alone. Nothing is written into the template itself.

## Stored icons that stop resolving

A profile changes: a library is removed, an upgrade drops an icon, a version range stops matching. The stored
values are **never deleted or rewritten**. They keep applying, a renderer shows its fallback for them, and they
resolve again if the icon returns.

Two functions report what has stopped resolving, as **warnings**:

- `inspect` adds them to a node's `diagnostics`, covering the node's own icon properties and the values and
  items contributed to it.
- `diagnoseIcons(document, context)` reports every icon in what the editing scope renders. Each diagnostic names
  the component, the property, the collection item and, for a contributed value, the instance that set it.

To ask what a change *would* break before making it, collect the usages across the document and compare the
current and proposed catalogs (see [Migrate existing icon values](migrate-existing-icon-values.md)):

```ts
import { analyzeIconImpact, collectIconUsages } from '@cratis/scene.engine';

const report = await analyzeIconImpact(collectIconUsages(document, descriptorCatalog), current, proposed);
```

`collectIconUsages` finds the icons components carry and the instance overrides, including collection-item icon
fields. Its locations read `<owner or instance>:<component>:<path>[:<itemId>:<field>]`.
