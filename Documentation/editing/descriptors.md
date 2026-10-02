---
title: Describing what can be edited
description: Property descriptors, component descriptors and how packages ship them next to their components.
---

A **property descriptor** says everything an editor needs to know about one property without loading the
component that reads it.

```ts
const pageSize: PropertyDescriptor = {
    path: 'pageSize',
    label: 'Page size',
    group: 'Data',
    valueType: PropertyValueType.Number,
    default: 25,
    constraints: { minimum: 1, maximum: 100, integer: true },
};
```

| Field | Meaning |
| --- | --- |
| `path` | Where the value lives: a key (or dotted path) in an `ExternalComponent`'s `properties` bag, or the node's own property name for model-native nodes such as a flow container |
| `label`, `group`, `description` | What an inspector shows |
| `valueType` | `string`, `number`, `boolean`, `enum`, `icon`, `destination`, `queryReference`, `collection`, `object` |
| `choices` | The allowed values of an `enum` |
| `default` | The value in effect when none is stored |
| `constraints` | `required`, `minimum`, `maximum`, `integer`, `minimumLength`, `maximumLength`, `pattern`, `minimumItems`, `maximumItems`, `resultShapes` |
| `editorKind` | Names a specialised editor (`iconPicker`, `queryBinding`, `screenPicker`). A host that does not know the name falls back to the default editor for `valueType` |
| `item` | For a `collection`: the descriptors of an item's fields |
| `readOnly` | Shown, never edited |

## Value types

- **icon** holds an `IconReference`: `{ library, key, variant? }`. Equality is all three fields; a label,
  class name or SVG is never identity. When the editing context carries an effective icon catalog, an icon value
  is also checked against it - see [Icons in editing](../icon-libraries/icons-in-editing.md).
- **destination** holds a `DestinationReference`: `{ screen, routeParameterBindings? }`. Scene names screens; a
  renderer turns the name into a route.
- **queryReference** holds a [`QueryBinding`](query-binding.md). A plain query name - what screens carried
  before bindings existed - is still accepted.
- **collection** holds an array of items. Every item has a string `id` that is unique within the collection and
  is assigned by whoever creates the item; position is never identity.

## Shipping descriptors

A package ships `ComponentDescriptor`s in the `descriptors` list of its `ScenePackageBundle`, keyed by the same
`<package>:<name>` string it registers the component under:

```ts
export const corePackage: ScenePackageBundle = {
    manifest: corePackageManifest,
    components: coreComponents,
    descriptors: coreDescriptors,
};
```

`validatePackageBundle` checks that every descriptor names a component the manifest declares, that none is
repeated, and that collections describe their items and enums list choices.

Build a catalog from the descriptors of the active packages and hand it to the engine:

```ts
const catalog = createDescriptorCatalog(activePackages.flatMap(bundle => bundle.descriptors ?? []));
```

The catalog is a derived view, not a registry anything registers into. When two descriptors name the same
component the later one wins, the same rule a profile's package order already applies to components.

`core` describes `button`, `action` (command and argument mapping), `column` and the new `navigationBar`.
`Cratis.Components` describes the query-bound tables.

## Layout types

Layout types have descriptors too, built into the engine rather than shipped by a package, because the model
itself defines them. See the [layout type reference](layout-types.md).
