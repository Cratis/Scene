---
title: The application structure reference
description: The read-only description of an application's modules, features and slices (and each slice's kind) that navigation targets, toolbar buttons and template applicability resolve against, who supplies it, and how the engine answers questions about it.
---

Several rules need to know which modules, features and slices an application *has*, and what kind of slice each one
is: a navigation item that targets a module goes to the module's first feature, a toolbar button may only invoke a
State Change slice, and a dialog template is only applicable to a State Change slice. A scene document does not carry
that knowledge. The **application structure** is a read-only description of it that the host passes to the engine.

## Who supplies it

The structure is a *reference input*, not document content. It is never written into a `SceneDocument`.

| Host | Builds the structure from |
| --- | --- |
| Stage | the compiled application model (its converter) |
| Studio | the project hierarchy and its state change slices |
| Tests and tooling | a JSON literal, as in `application-structure-fixtures.json` |

## Shape

`ApplicationStructure` (`@cratis/scene.model`, `Cratis.Scene.Model.Structure`):

| Type | Properties |
| --- | --- |
| `ApplicationStructure` | `modules` |
| `ModuleNode` | `id`, `name`, `features`, `slices?` |
| `FeatureNode` | `id`, `name`, `features` (sub-features), `slices` |
| `SliceNode` | `id`, `name`, `kind` |
| `SliceKind` | `StateChange`, `StateView`, `Automation` |

```json
{
  "modules": [
    {
      "id": "sales",
      "name": "Sales",
      "features": [
        {
          "id": "orders",
          "name": "Orders",
          "features": [],
          "slices": [
            { "id": "PlaceOrder", "name": "Place order", "kind": "StateChange" },
            { "id": "OrderSummary", "name": "Order summary", "kind": "StateView" }
          ]
        }
      ]
    }
  ]
}
```

A node's `id` is the *local* identity, unique among its siblings. The **qualified id** is the dotted path from the
module down - `sales`, `sales.orders`, `sales.orders.PlaceOrder` - and is the same form a `DestinationReference`
uses in its `module`, `feature` and `slice`. Features nest, so `sales.orders.returns.CreateReturn` is a slice of the
`returns` sub-feature of `orders`. A module may also own slices directly (`tools.Reindex`).

## Asking questions of it

`ApplicationStructureIndex` (`engine/structure` in TypeScript, `Cratis.Scene.Engine.Structure` in .NET) indexes a
structure once and answers lookups. It is pure: no DOM, no React, nothing is rewritten.

| TypeScript | .NET | Answers |
| --- | --- | --- |
| `findModule(moduleId)` | `FindModule` | the module, or nothing |
| `findFeature(qualifiedId)` | `FindFeature` | the feature at that dotted path (any depth) |
| `firstFeature(moduleId)` / `firstFeatureId(moduleId)` | `FirstFeature` / `FirstFeatureId` | the first declared top-level feature - where a module target navigates to |
| `findSlice(qualifiedId)` | `FindSlice` | the slice at that dotted path |
| `kindOf(sliceId)` | `KindOf` | the slice's `SliceKind`, or nothing for an unknown slice |
| `findFeaturesByName(name)` | `FindFeaturesByName` | the qualified ids of every feature with that name (case-insensitive), so a caller can tell a bare name is ambiguous |
| `diagnostics` | `Diagnostics` | the problems found while indexing |

A feature id is never a slice and vice versa: `findSlice('sales.orders')` and `findFeature('sales.orders.PlaceOrder')`
both resolve to nothing. A module without features has no first feature.

## Diagnostics

| Code | Meaning |
| --- | --- |
| `structureDuplicateId` | Two siblings (modules; or the features and slices of one container) share an id. The first declaration wins; later ones are ignored by lookups. |
| `structureAmbiguousName` | Two siblings of the same kind with different ids share a display name (case-insensitive), so a picker or a name lookup cannot tell them apart. |

Features with the same name in *different* modules are not a problem - their qualified ids differ.

## Shared fixtures

Both engines are asserted against `application-structure-fixtures.json`: qualified lookup, nested features, first
feature, a module without features, duplicate ids, and same-named features in different modules. The C# spec is
`Engine.Specs/for_ApplicationStructureIndex`, the TypeScript spec is `engine/for_applicationStructureIndex`. The
shapes are mirrored in `scene-model-shape.json`.
