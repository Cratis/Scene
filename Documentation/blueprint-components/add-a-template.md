---
title: Add a template of your own
description: Write an Arc-bound page template that composes with the default blueprint's shell, and prove it does.
---

Sooner or later your application needs a page shape this blueprint does not ship — a queried list with an
approval rail down the side, a command page that opens with a summary. This is the recipe.

Two rules make the difference between a template that composes and one that only works where you first put
it. Both are stated up front because both are easy to get wrong in a way that looks fine.

## Rule one: never invent a slot name

`fitsSlot` names the slot on your parent that you fill. It is resolved against *whatever contains you*, so
the name has to be one your parent really declares. There are exactly two vocabularies:

- `SlotName` — the default blueprint's layout regions: `topbar`, `sidebar`, `menu`, `breadcrumb`,
  `content`, `footer`, `rightPanel`, `configPanel`, `aside`.
- `TemplateSlotName` — what a screen template offers to what it contains: `header`, `body`, `sidePanel`,
  `toolbar`, `actions`, `stats`, `primary`, `secondary`.

A whole page fits `SlotName.Content`, because that is the only region a layout offers a screen. Anything
nested fits one of its parent's `TemplateSlotName`s.

## Rule two: within one chain, a fitted slot name has exactly one declarer

`resolveScreenTemplates` places a template only when the containers in scope agree on **exactly one** home
for it. Two containers declaring the same name is not resolved by preferring the nearer one — it is
reported as unplaced, because guessing would put content in the wrong region, which is far harder to
diagnose than being told the name is ambiguous.

So a chain that reuses `body` at three levels reads perfectly and resolves to nothing. This blueprint's
chain is built to avoid that: `body` is declared only by the module, `primary` only by the feature.

```typescript
export const dataModulePageTemplate: ScreenTemplate = {
    name: 'DataModulePage',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Body }, { name: TemplateSlotName.SidePanel }],
    // ...
};

export const dataFeatureSectionTemplate: ScreenTemplate = {
    name: 'DataFeatureSection',
    fitsSlot: TemplateSlotName.Body,
    slots: [{ name: TemplateSlotName.Toolbar }, { name: TemplateSlotName.Primary }, { name: TemplateSlotName.Secondary }],
    // ...
};

export const commandSliceSectionTemplate: ScreenTemplate = {
    name: 'CommandSliceSection',
    fitsSlot: TemplateSlotName.Primary,
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Actions }],
    // ...
};
```

`header` appears twice and that is fine — nothing in the chain *fits* `header`, so it is never ambiguous.
The constraint is only on names something fits.

## Write the template

Start from the element builders this package exports, so you are not rebuilding decisions it already made:

```typescript
import { ScreenTemplate } from '@cratis/scene.model';
import { SlotName, TemplateSlotName } from '@cratis/scene.blueprint.default';
import { arcPageHeader, dataPage, page, toolbar, toolbarButton } from '@cratis/scene.blueprint.components';

export const purchaseOrderListTemplate: ScreenTemplate = {
    name: 'PurchaseOrderList',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Body }],
    content: {
        [TemplateSlotName.Header]: [
            arcPageHeader('po-header', { title: 'Purchase orders', subtitle: 'Awaiting approval', section: 'Procurement', query: 'AllPurchaseOrders' }, [
                toolbar('po-actions', [toolbarButton('po-approve', 'Approve the selected order', 'pi pi-check', 'Approve')]),
            ]),
        ],
        [TemplateSlotName.Body]: [
            dataPage('po-body', 'AllPurchaseOrders', { emptyMessage: 'No purchase orders yet', dataKey: 'purchaseOrderId', globalFilterFields: ['number', 'supplier'] }, [
                { field: 'number', header: 'Number' },
                { field: 'supplier', header: 'Supplier' },
                { field: 'total', header: 'Total' },
            ]),
        ],
    },
    displayName: 'Purchase order list',
    description: 'A dataPage bound to the purchase order query, with an approval action.',
};
```

Three things in there are worth calling out.

**The binding is a name, never a class.** A property bag carries plain values and named slots; there is no
way to put a TypeScript class in one. `resolveElementBinding` reads the name back out at render time and
looks it up in the binding registry — do not invent a second mechanism for reaching a backend, because the
one that exists is the one every adapter uses.

**`emptyMessage` and `dataKey` are required by `TableOptions` on purpose.** The library's adapters both
default them to an empty string, and both defaults are quietly wrong in a shipped template: a table with no
empty message reads as broken when the query legitimately returns nothing, and one with no data key loses
its selection every time the query is re-performed.

**The header carries the binding too.** Give it the same one the body is built around, and the heading, the
trail and the design-time state all follow from saying it once — instead of three copies that drift.

## Add an arrangement only when declaration order is wrong

A template with no `arrangement` renders its slots in declaration order, which is right more often than
not. Add one when the page has a real two-dimensional shape, and add the compact override in the same
breath:

```typescript
arrangement: {
    root: column([slotLeaf(TemplateSlotName.Header), grid([slotLeaf(TemplateSlotName.Primary, { span: 2 }), slotLeaf(TemplateSlotName.Secondary)], 3, 16)]),
    overrides: [
        {
            width: WidthSizeClass.Compact,
            root: column([slotLeaf(TemplateSlotName.Header), slotLeaf(TemplateSlotName.Primary), slotLeaf(TemplateSlotName.Secondary)], 16),
        },
    ],
},
```

A leaf naming a slot you never declared positions nothing and reports nothing — the region simply is not
there. No type can express "one of whatever this container declared", so prove it with a spec instead.

## Prove it composes

Three checks, and every one of them is a spec this package already runs against its own templates.

**It finds exactly one home**, with the other blueprint's templates in scope too — because that is the
situation a real profile is in:

```typescript
const resolution = resolveScreenTemplates(appShellLayout, [...(defaultBlueprint.screenTemplates ?? []), purchaseOrderListTemplate]);
resolution.unplaced.filter(unplaced => unplaced.template === 'PurchaseOrderList').should.be.empty;
```

**Every component name it writes resolves**, against a catalog built from the real manifests:

```typescript
const names = distinctComponentNames(Object.values(purchaseOrderListTemplate.content ?? {}).flat());
names.map(name => resolveComponentName(name, componentsBlueprintProfile, componentsBlueprintCatalog))
    .filter(resolution => resolution === undefined)
    .should.be.empty;
```

If a name does not resolve, fix the template rather than the spec. The default blueprint hit exactly this:
it referenced `chart` and `fileUpload`, which neither library declares — two names that look obvious and
render as dashed red boxes.

**Its content is filed only under slots it declares:**

```typescript
const declared = new Set(purchaseOrderListTemplate.slots.map(slot => slot.name));
Object.keys(purchaseOrderListTemplate.content ?? {}).filter(name => !declared.has(name)).should.be.empty;
```

## When to write a component instead

Almost never. Prefer a template every time: a template is data a host can rearrange, and a component is
code it cannot.

The bar this blueprint holds itself to is that a content tree genuinely *cannot express* the composition —
which in practice means the thing derives or looks something up at render time rather than holding it. One
component in this package clears it, and it is worth reading
[layering on another blueprint](layering-on-a-blueprint.md) for why. If you do register one, declare it in
your manifest, or `validatePackageBundle` fails:

```typescript
validatePackageBundle(componentsBlueprint).should.be.empty;
```

## Where to go next

- [The template catalogue](template-catalogue.md) — the shapes you may not need to write at all.
- [Wire the binding registry](wiring-the-binding-registry.md) — supplying the class behind your name.
- [Ship your own blueprint](../blueprints/ship-your-own-blueprint.md) — when a template set is not enough.
