---
title: Inspecting and editing
description: inspect, applyEdit, the edit kinds, node identity and the diagnostics a refused edit returns.
---

## Node identity

A node is addressed by a string id. The engine builds them; Studio should not parse them.

| Node | Id builder | Example |
| --- | --- | --- |
| Layout, template, dialog template, screen | `layoutNodeId`, `screenTemplateNodeId`, `dialogTemplateNodeId`, `screenNodeId` | `screenTemplate:Page` |
| Slot | `slotNodeId(ownerId, name)` | `screenTemplate:Page#slot:main` |
| Element | `elementNodeId(elementId)` | `element:orders` |
| Flow node | `flowNodeId(holderId, variant, indexPath)` | `…#flow:root.0.1` |
| Freeform arrangement, placement | `freeformNodeId`, `placementNodeId` | `…#freeform:1#placement:chart` |

Element ids are unique across the whole document and survive moves, so they are the stable handle on a
component. Flow nodes have no identity of their own: their id is a structural address and names the same node
only until the tree around it changes. Read ids from the same revision of the document you act on.

## inspect

```ts
const inspection = inspect(document, 'element:orders', { catalog, scope });
```

A `NodeInspection` carries:

- `kind`, `typeId`, `label`, `parentId` - what the node is and where it sits;
- `provenance` - `local`, `inherited` or `configurableInherited`, plus the owning layout or template;
- `properties` - one `InspectedProperty` per described property, with `currentValue` (stored),
  `effectiveValue` (after defaults and instance contributions), `source`, `editable`, `editTarget`
  (`node` or `instance`) and the `reason` when it is not editable;
- `capabilities` - for a layout node, what the type can do;
- `removable`, and `diagnostics` for anything wrong with the node.

For an exposed collection, `operations` lists what the scope may do and `items` lists each item with its
`origin` and whether the scope can change it.

## applyEdit

```ts
const outcome = applyEdit(document, edit, context);
// { model, diagnostics, applied }
```

Edits are plain records, discriminated by `kind`, so a host can persist and replay them.

| Kind | Does |
| --- | --- |
| `setProperty`, `resetProperty` | Set or clear a property on a node the scope owns. A freeform element is changed in every size-class copy |
| `changeLayoutType` | Convert a layout node. A lossy conversion is refused, naming what would be lost, unless `acceptLoss` is set; it then proceeds with a warning |
| `insertNode`, `moveNode`, `removeNode` | Structure. Inserting into a flow container wraps an element in a leaf; removing the element a leaf holds removes the leaf; moving checks containment and cycles |
| `setInstanceValue`, `resetInstanceValue` | Configure an exposed scalar from the scope's own instance |
| `addCollectionItem`, `removeCollectionItem`, `reorderCollectionItem`, `editCollectionItem` | Configure an exposed collection, one item at a time, by item id |
| `exposeProperty`, `unexposeProperty` | Declare what a layout or template lets its consumers configure |

An edit that fails any check returns the **same** document object, `applied: false`, and the diagnostics.
Nothing is half applied. Warnings (`lossyConversion`) do not refuse the edit.

## Diagnostics

Every finding is a `SceneDiagnostic` with a `code` from `DiagnosticCode`, a `severity`, a human-readable
`message`, and whichever of `nodeId`, `instance`, `component`, `path`, `itemId` apply. Switch on the code; show
the message. The same shape is used by inspection, editing, query-binding validation and configuration
resolution.

## Undo and redo

The engine is pure, so history is the host's: keep the documents either side of an edit. The documents are
plain JSON, so they can be saved, loaded and compared structurally.
