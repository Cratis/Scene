---
title: Layout type reference
description: Every layout type, what it can do, and what it can be converted into.
---

`layoutTypeDescriptors` holds one `LayoutTypeDescriptor` per `LayoutType`. An editor reads
`capabilities` to decide what to offer; `changeLayoutType` enforces `convertibleTo`.

| Type | Children | Placement | Grid span | Size-class variants | Converts to |
| --- | --- | --- | --- | --- | --- |
| `flowRow` | yes | ordered | no | yes | `flowColumn`, `flowGrid` |
| `flowColumn` | yes | ordered | no | yes | `flowRow`, `flowGrid` |
| `flowGrid` | yes | ordered | yes | yes | `flowRow`, `flowColumn` |
| `flowLeaf` | one element | none | yes | no | - |
| `flowSlotLeaf` | none | none | yes | no | - |
| `freeform` | yes | positioned | no | yes | - |
| `stackPanel` | yes | ordered | no | no | `wrapPanel`, `dockPanel` |
| `wrapPanel` | yes | ordered | no | no | `stackPanel`, `dockPanel` |
| `dockPanel` | yes | ordered | no | no | `stackPanel`, `wrapPanel` |
| `gridPanel` | yes | ordered | yes | no | - |
| `canvas` | yes | positioned | no | no | - |

## Conversions

A conversion keeps the children. What it can lose is what only the old type has:

- grid to row or column drops `columns`, `rows` and the children's `span`;
- stack, wrap and dock panels each own some of `orientation`, `spacing`, `itemWidth`, `itemHeight` and
  `lastChildFill`; converting drops the ones the target does not have.

A value that is unset (or `spacing` of zero) is not a loss. Anything real is, and the edit is refused with a
`lossyConversionNotAccepted` diagnostic that names it, until the edit sets `acceptLoss`. Then it applies with a
`lossyConversion` warning listing the same.

## Placements

A freeform arrangement has one variant per size class. A node inside a freeform element repeats in every
variant, so a property change, an insert or a removal is applied to each copy. A placement's own position and
size (`x`, `y`, `width`, `height`) are the editable properties of the placement node.
