---
title: Exposing a template to its screens
description: How a template author lets screens configure a component, how that narrows through nested templates, and how the values resolve.
---

A screen template might contain a navigation bar with a fixed Home item. The template author wants every
screen on the template to add its own items, but not to remove Home or to restyle the bar. That is **exposure**.

## Three roles

- **Owner** - the layout or template that contains the component. Its descriptor lists what the component
  *supports*.
- **Exposure** - the owner picks some of those properties (and for collections, some operations and fields) to
  hand to whatever sits inside it. Exposure only ever narrows.
- **Instance contribution** - a screen, or a template nested in the owner's slot, stores values for what was
  exposed to it, in its own data, keyed by instance, component and property path.

```ts
document.exposures.push({
    owner: 'Module',
    properties: [{
        component: 'navigation',
        path: 'items',
        operations: [CollectionOperation.Add, CollectionOperation.Reorder],
        editableFields: ['label', 'icon', 'destination'],
    }],
});
```

A collection exposed without `operations` exposes nothing a consumer can change. Operations are granted one by
one: `add`, `remove`, `reorder`, `edit-fields`. A consumer can only change items **it** added; the owner's
items are fixed, and so are items another instance added.

## Nesting

An owner's exposure reaches the instance directly inside it. It reaches further only when each template in
between **re-exposes** it:

```ts
{ component: 'navigation', path: 'items', reExposes: 'Module', operations: [CollectionOperation.Add] }
```

A re-exposure can never grant more than the owner it passes on: extra operations or fields are dropped and
reported as `exposureWidensOwner`. A re-exposure of something the owner never exposed is `reExposureBroken`.

## Resolving

```ts
const chain = resolveTemplateChain(document, scope);
const configuration = resolveEffectiveConfiguration(chain, document.instanceContributions, catalog);
```

The chain runs outermost first: layout, each template down to the one the screen fills, then the screen. The
result is deterministic: the owner's value first, then each level from the outermost inwards. The innermost
level wins a scalar; collection items are appended after the owner's, in nesting order, each level's items in
the order it saved them.

`EffectiveConfiguration.components` holds, per configurable component, the full `properties` bag a renderer
should use and a record of where each exposed value came from (`default`, `local`, `instance`), the inherited
value it would go back to on reset, and the collection `items` with their `origin`.

To render it, pass it to `SceneElementView` as `configuration`, or call `applyEffectiveConfiguration(element,
configuration)` yourself. Elements with nothing to change keep their identity.

## When things change underneath saved values

Contributions are stored apart from the template, so changing the template reaches every instance. When what
they refer to changes, nothing is deleted:

| What changed | Result |
| --- | --- |
| Exposure withdrawn | Saved values are ignored and reported (`contributionNotExposed`); they apply again when it is exposed again |
| Component removed or renamed | `contributionTargetMissing` or `exposureTargetMissing` |
| Property removed from the descriptor | `exposureTargetMissing` |
| Value no longer fits the property's type | Ignored, `contributionTypeMismatch` |
| Item field no longer exists | The field is ignored, `unknownCollectionField` |
| Item id collides with the owner's | The contributed item is ignored, `duplicateCollectionItem` |

## The navigation bar

`core:navigationBar` is the first component built for this. Its `items` property is a collection of
`{ id, label, icon?, destination }`, where `icon` is an `IconReference` and `destination` a
`DestinationReference`. Activating an item dispatches the same `cratis.scene.navigate` event as `core:navigate`.
