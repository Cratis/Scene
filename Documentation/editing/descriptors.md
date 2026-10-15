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
| `valueType` | `string`, `number`, `boolean`, `enum`, `icon`, `destination`, `queryReference`, `collection`, `object`, `json` |
| `choices` | The allowed values of an `enum` |
| `default` | The value in effect when none is stored |
| `constraints` | `required`, `minimum`, `maximum`, `integer`, `minimumLength`, `maximumLength`, `pattern`, `minimumItems`, `maximumItems`, `resultShapes` |
| `editorKind` | Names a specialised editor (`iconPicker`, `queryBinding`, `screenPicker`, or an id of the [editor vocabulary](#the-editor-vocabulary)). A host that does not know the name falls back to the default editor for `valueType` |
| `editorOptions` | The parameters of the named editor: `multiline`, `placeholder`, `unit`, `step`, `kinds`, `reference`, `fieldKinds`, `tokensOnly` |
| `item` | For a `collection`: the descriptors of an item's fields. `open` keeps fields it does not list; `positional` makes `id` optional for authored data such as chart datasets or tree nodes, which are told apart by position |
| `properties` | For an `object`: the descriptors of its fields, so a host can edit it without a specialised editor |
| `readOnly` | Shown, never edited |

## The editor vocabulary

`editorKind` is a string, so a package can name an editor of its own. Scene also defines the ids a host's editor registry resolves,
as `PropertyEditorKind` (spec section 8). Scene defines only the id and its parameters - the editors themselves belong to the host.

| Id | For | Parameters (`editorOptions`) |
| --- | --- | --- |
| `text` | string | `multiline`, `placeholder` |
| `number` | number | `constraints.minimum`/`maximum`, `step`, `unit` |
| `boolean` | boolean | |
| `enum` | enum with up to four choices (segmented chips) | |
| `select` | enum with more choices (dropdown with a filter) | |
| `color` | a theme token or a hex colour | `tokensOnly` |
| `icon` | an `IconReference` | |
| `list` | an array of simple items | |
| `reference` | the id of another model element | `reference: { target, kinds?, predicate? }` - `target` is required |
| `navigationTarget` | the target of a navigation item (Module > Feature) | |
| `renderingSlot` | a slot of the effective template | |
| `slice` | a slice | `kinds` (for example `['StateChange']`); the rest are shown disabled with a reason |
| `inheritanceMode` | `inherit`, `extend` or `override` | |
| `template` | a template reference (the template picker) | |
| `sampleData` | a sample data pack reference | |
| `field` | a field of the bound shape | `fieldKinds` |
| `columnList` | a table's columns, `{ field, header, width, align, format }` | |
| `stringList`, `numberList`, `stringOrList`, `scalar`, `stringMap` | values with no fields to describe | |

`predicate` names a rule the host interprets, exactly like a design-time action's `availability`: the model carries no functions.
`validatePackageBundle` reports a `reference` editor without a target, a `step` that is not positive, and an empty `kinds`
(`propertyEditorOptionsInvalid`).

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
- **object** holds a plain record. When `properties` describes its fields - each a single name relative to the
  object, and each free to be an `object` or `collection` itself - the value is checked field by field: a field
  the descriptor does not describe is refused unless the descriptor is `open` (its `open` flag, or the `open` flag of a
  collection's `item`, keeps undescribed fields as they are without editing them), a described field must fit its descriptor, and `required` fields
  must be present. A host edits it with a nested form built from `properties`, and icons in described fields are
  checked against the icon catalog. Without `properties` the value is any record or array and only the
  descriptor's `editorKind` knows how to edit it. Prefer an `object` with `properties` (or a `collection`) over
  `json` whenever the shape is known.
- A **list of plain values** (words, numbers) or a **record of values under the author's own names** has no fields to
  describe. It is a `json` (list) or `object` (record, no `properties`) property whose `editorKind` is one of
  `PropertyEditorKind`: `stringList`, `numberList`, `stringOrList`, `scalar` or `stringMap`. A host draws a control per
  entry for these, so none of them is edited as JSON text.
- **json** holds any JSON value - `null`, a string, a boolean, a finite number, or an array or plain object of
  those, nested up to 64 levels - and stores it exactly as given, without reshaping or serializing it. It is
  for free-form configuration such as a chart's data. `NaN`, infinities, `undefined`, functions, class
  instances and cycles are rejected. A host edits it through the `editorKind` that says what it holds (see above); a
  `json` property with no `editorKind` has no editor a host can draw, so describe it. Icons nested inside a `json` value are not found by the icon library diagnostics;
  use an `icon` property where tracking matters.
- **enum** choices may be numbers as well as strings. A stored value must equal a choice exactly, so a document
  that stores `4` needs a `4` choice; a host choice control must keep the choice's own type rather than reading
  it back as text.

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
repeated, that collections describe their items and enums list choices, and that design-mode and editor parameters are sound.

Build a catalog from the descriptors of the active packages and hand it to the engine:

```ts
const catalog = createDescriptorCatalog(activePackages.flatMap(bundle => bundle.descriptors ?? []));
```

The catalog is a derived view, not a registry anything registers into. When two descriptors name the same
component the later one wins, the same rule a profile's package order already applies to components.

`core` describes `button`, `action` (command and argument mapping), `column` and the new `navigationBar`.
`Cratis.Components` describes the query-bound tables.

## Component metadata

A component's descriptor also says how a picker presents it and how a designer edits it on the surface (spec 3.4, CMP1):

```ts
const dataTable: ComponentDescriptor = {
    component: 'Cratis.Components:dataTable',
    displayName: 'Data table',
    category: ComponentCategory.DataDisplay,
    icon: componentIcon('table'),
    badge: 'Tb',
    keywords: ['grid', 'list', 'rows'],
    properties: [/* ... */],
};
```

| Field | Meaning |
| --- | --- |
| `category` | The group a picker lists the component under. **Every component declares one** (CMP1). One of `ComponentCategory` - Navigation, Data display, Input, Actions, Layout, Feedback, Overlay, Forms - or a category the package adds (reported as the warning `componentCategoryUnknown`) |
| `icon` | An `IconReference`. The built-in components use `componentIcon(key)`, an icon of the `Cratis.Icons.Lucide` library |
| `badge` | Two letters a picker draws when it has no icon. Absent means derived from the name by `componentBadge` (`Card grid` is `Cg`, `Button` is `Bt`) |
| `keywords` | Words a picker's filter matches besides the name and the category |
| `designMode` | How the component is edited directly on the design surface - see [design mode](design-time-extensions.md#design-mode) |

`validateComponentDescriptors(descriptors, registered?)` is the rule, in the engine: `componentCategoryMissing` (an error) for a
registered component that has no descriptor or declares no category, `componentCategoryUnknown` (a warning), `componentDesignModeInvalid`
and `propertyEditorOptionsInvalid`. `validateComponentMetadata(bundle)` runs it over a package bundle. It is deliberately not part of
`validatePackageBundle`, which gates what a host loads: a third-party package written before categories existed must still load; a designer
(and every package's own CMP1 specification) runs `validateComponentMetadata`.

A picker's filter and its "Frequently used" group are rules too, so every host behaves alike (the shared corpus
`component-metadata-fixtures.json` states them):

- `matchComponentQuery(descriptor, text)` - case-insensitive; the display name and the keywords match by substring, the category by the start
  of one of its words (`nav` finds Navigation; `ta` does not find everything under `Data display`). It reports the ranges of the name to highlight
  and, when only a keyword matched, which keyword, for the hint "matches "ta" via keyword "table"".
- `rankFrequentlyUsedComponents(usage)` - at most six, by count descending, then most recent use, then name.
- `componentBadge(descriptor)` - the two-letter badge.

A package keeps this data in one table per package (`describeComponents(packageName, handWrittenDescriptors, table)` merges it into the
descriptors, and gives a component with nothing to edit a descriptor with no properties), so adding a component and forgetting its category fails the package's specification.

## Layout types

Layout types have descriptors too, built into the engine rather than shipped by a package, because the model
itself defines them. See the [layout type reference](layout-types.md).
