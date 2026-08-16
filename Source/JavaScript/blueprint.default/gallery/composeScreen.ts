// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent, Layout, SceneElement, Screen, ScreenTemplate } from '@cratis/scene.model';
import { shellComponentForLayout } from '../layouts';
import { externalComponent } from './elements';

/**
 * Turns a {@link ScreenTemplate}'s content into slot content on the {@link Layout} that contains it.
 *
 * The rule has two halves, and both matter. Content filed under a slot the *layout* also declares stays
 * under that name - which is how a sign-in template's branding half reaches the full-page layout's `aside`
 * region rather than being buried inside the form column. Everything else flows into the slot the
 * template's `fitsSlot` names, because that is what `fitsSlot` means: this template occupies that region.
 *
 * @param template The template to place.
 * @param layout The layout it is placed into.
 * @returns Slot content keyed by the layout's own slot names.
 */
export function templateContentInLayout(template: ScreenTemplate, layout: Layout): Record<string, SceneElement[]> {
    const layoutSlots = new Set(layout.slots.map(slot => slot.name));
    const placed: Record<string, SceneElement[]> = {};
    const ownSlotOrder = template.slots.map(slot => slot.name);
    const content = template.content ?? {};

    for (const slotName of ownSlotOrder) {
        const elements = content[slotName];
        if (!elements || elements.length === 0) {
            continue;
        }

        const target = layoutSlots.has(slotName) ? slotName : template.fitsSlot;
        if (!target) {
            continue;
        }

        placed[target] = [...(placed[target] ?? []), ...elements];
    }

    return placed;
}

/**
 * Folds a containment chain of screen templates into the outermost one.
 *
 * This is `fitsSlot` doing its job, applied repeatedly. A slice's template fits a slot on the feature's
 * template, which fits a slot on the module's, which fits a slot on the application layout - so the way to
 * place the slice is to place it in the feature, place *that* result in the module, and hand the module to
 * the layout. Folding from the inside out means the rule is written once and the chain can be any depth.
 *
 * The alternative - filing a nested template's content under its own `fitsSlot` at the top level - looks
 * right and is not: the layout has no `body` slot, so the content lands in a region nothing renders and
 * the screen comes up empty with nothing to explain it.
 *
 * @param chain The templates from outermost to innermost. A chain of one is returned unchanged.
 * @returns A template with the same slots and `fitsSlot` as the outermost, carrying the whole chain's content.
 */
export function nestScreenTemplates(chain: ScreenTemplate[]): ScreenTemplate {
    return chain.reduceRight((inner, outer) => (inner === outer ? outer : placeInside(outer, inner)));
}

function placeInside(outer: ScreenTemplate, inner: ScreenTemplate): ScreenTemplate {
    if (!inner.fitsSlot) {
        return outer;
    }

    const innerContent = inner.slots.flatMap(slot => inner.content?.[slot.name] ?? []);
    return {
        ...outer,
        content: {
            ...outer.content,
            [inner.fitsSlot]: [...(outer.content?.[inner.fitsSlot] ?? []), ...innerContent],
        },
    };
}

/**
 * Builds the element tree that renders a {@link Screen}.
 *
 * The screen's slot content becomes the shell component's slots one-for-one, which is the whole trick: a
 * layout's slots and a shell component's slots are the same vocabulary, so nothing has to translate
 * between them and a slot filled under a name the shell does not read is a spec failure rather than a
 * silently missing region.
 *
 * @param screen The screen to render.
 * @returns The shell element, ready for `SceneElementView`.
 */
export function composeScreenElement(screen: Screen): ExternalComponent {
    const shell = shellComponentForLayout(screen.layout);
    if (!shell) {
        throw new Error(`Screen '${screen.name}' names the layout '${screen.layout}', which this blueprint does not provide.`);
    }

    return externalComponent(`screen-${screen.name}`, shell, { screenName: screen.name }, screen.slotContent);
}
