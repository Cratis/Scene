---
title: Composing screens from templates
description: How a nested chain of screen templates is folded and placed into a layout's slots, and how an arrangement changes with the size class.
---

[Layouts](./layouts.md) and [screen templates](./screen-templates.md) explain what the two structures are
and how `FitsSlot` makes them nest. This page is about what happens when something actually places one -
the step between "this template fits the content slot" and "here is a screen on the screen".

It matters because the obvious implementation is wrong in a way that produces no error at all.

## Placing a single template

A template that fits the layout's own `content` slot is the easy case. Its content is filed under its own
slot names, and all of it flows into `content`.

One nuance decides where each piece lands:

```ts
const target = layoutSlots.has(slotName) ? slotName : template.fitsSlot;
```

Content filed under a name the **layout** also declares stays under that name; everything else flows into
the slot `fitsSlot` names.

That first branch is not a special case, it is a feature. The `Login` template declares an `aside` slot, and
so does the `FullPage` layout - so the branding half of a sign-in screen reaches the layout's `aside` region
rather than being buried inside the form column. A template can reach a layout region directly by naming it.

## Placing a chain

Now the case that is easy to get wrong. `SliceSection` fits `FeatureSection`'s `body`, which fits
`ModuleWorkspace`'s `body`, which fits the layout's `content`.

The tempting implementation is to file the slice template's content under its own `fitsSlot` - `body` - at
the top level. It reads correctly and it is wrong: the `AppShell` layout has no `body` slot, so the content
lands in a region nothing renders. The screen comes up empty, no exception is thrown, and nothing points
back at the cause.

:::caution
This is not hypothetical. It is the bug a spec over the gallery caught while the default blueprint was
being written, and it is exactly why "every screen fills only slots its layout declares" is worth a spec.
:::

The correct move is to fold the chain from the inside out: place the slice in the feature, place that
result in the module, and hand the module to the layout.

```ts
export function nestScreenTemplates(chain: ScreenTemplate[]): ScreenTemplate {
    return chain.reduceRight((inner, outer) => (inner === outer ? outer : placeInside(outer, inner)));
}
```

`placeInside` appends the inner template's content - already folded, so it carries everything below it -
to the outer template's content under the inner one's `fitsSlot`. The result has the outermost template's
slots and `fitsSlot`, so it is placeable in the layout by the ordinary single-template rule.

Because the fold is one operation applied repeatedly, the chain can be any depth. A chain of one is
returned unchanged, which is why almost every template pays nothing for a mechanism it does not use.

## From a screen to an element tree

A `Screen`'s `slotContent` is keyed by the layout's slot names, and a shell component's slots use the same
vocabulary. So rendering is a one-for-one handover rather than a translation:

```ts
export function composeScreenElement(screen: Screen): ExternalComponent {
    const shell = shellComponentForLayout(screen.layout);
    if (!shell) {
        throw new Error(`Screen '${screen.name}' names the layout '${screen.layout}', which this blueprint does not provide.`);
    }

    return externalComponent(`screen-${screen.name}`, shell, { screenName: screen.name }, screen.slotContent);
}
```

Sharing one vocabulary across the layout definition, the templates and the shell components is the point.
A slot filled under a name the shell never reads renders nothing *and reports nothing*, so the names are
one enum and the rest is covered by specs.

## What the size class does

A layout's arrangement is a `FlowArrangement`: a tree whose leaves reference slots by name, plus overrides
targeting a width size class, a height size class, or both. `evaluateFlowArrangement` picks the most
specific match — an override naming both axes beats one naming a single axis.

The `AppShell` layout declares three:

| Override | What leaves the flow | Why |
| --- | --- | --- |
| Compact width | sidebar, right panel | There is no width at which an 18rem panel and a 20rem panel both fit beside content on a phone |
| Compact height | breadcrumb, footer | A landscape phone has almost no vertical room, and two horizontal strips of chrome eat most of it |
| Compact width **and** height | all four | The most specific match, so a phone in landscape gets its own answer |

That third one is not redundant. Without it, a landscape phone would match both single-axis overrides,
`evaluateFlowArrangement` would pick whichever was declared last, and the screen would keep a footer it has
no room for — or a sidebar it has no width for, depending on declaration order. Targeting both axes is how
you stop the answer depending on the order you happened to write them in.

Leaving the flow is not the same as not being rendered. At a compact width the sidebar is still there —
off-canvas, over the content, behind the mask — it simply no longer *occupies* anything. That is a fact
about the arrangement, and the shell's [layout modes](./layout-modes.md) are what act on it.

## Next

- [Regions and slots](./regions-and-slots.md) — the region vocabulary this is arranging.
- [The template set](./template-set.md) — the twenty-three templates, including the three-level chain.
