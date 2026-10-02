---
title: Icon libraries
description: How Scene models icons - versioned icon libraries selected in a UI profile, library-qualified references, an on-demand catalog, and renderer adapters that turn a reference into artwork.
---

An icon in Scene is a reference to an entry in an icon library, not a CSS class or a piece of markup. A screen,
template or blueprint stores `{ library, key, variant? }`; the library says where the icon comes from, and the
renderer's adapter for that library decides what it looks like.

That split is what lets an application use Lucide and PrimeIcons side by side, lets Studio offer a picker over
every library a profile has, and lets a library be upgraded or removed with a report of exactly which stored
icons would stop resolving.

## The pieces

| Piece | Lives in | Responsibility |
| --- | --- | --- |
| `IconReference` | `@cratis/scene.model`, `Cratis.Scene.Model.Icons` | The persisted identity of one icon: `library`, `key`, optional `variant`. |
| Icon library package | `ScenePackage` with `kind: IconLibrary` | Names, versions, licenses and depends like any package; declares variants, renderers and attribution through `iconLibrary`. |
| `IconEntry` | `@cratis/scene.model` | One catalog record - key, name, categories, aliases, tags, variants. Metadata only. |
| `resolveIconLibraries`, `EffectiveIconCatalog` | `@cratis/scene.engine` | Which libraries a profile has and why, and the on-demand catalog over them. |
| `analyzeIconImpact` | `@cratis/scene.engine` | What removing or upgrading a library does to stored references. |
| `IconAdapter`, `SceneIcon` | `@cratis/scene.react` | Turns a reference into artwork, sized, colored and labeled. |

## Guides

- [Package an icon library](package-an-icon-library.md) - declare the package, ship a catalog and an adapter.
- [Look up and render icons](look-up-and-render-icons.md) - resolve libraries, search the catalog, draw a reference.
- [Migrate existing icon values](migrate-existing-icon-values.md) - what happens to icon strings such as `pi pi-home`.

## Understand

- [Why icon references name a library](understanding-icon-references.md) - identity, coexistence and why there is no precedence.
