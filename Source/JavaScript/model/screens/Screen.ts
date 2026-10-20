// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '../elements';
import { Form } from '../forms';
import { Contribution } from '../contributionPoints';
import { Behavior } from '../interactions';

/**
 * A named screen: the structure it fills, the content that fills it, the forms it hosts, and whatever it
 * contributes to contribution points elsewhere in the tree.
 *
 * A screen is an instance, not a shape. The shape comes from either the application's {@link Layout} — for
 * a screen that sits directly in the application shell — or a {@link ScreenTemplate}, for one nested
 * inside a module, feature or slice. Both declare slots; a screen only ever fills them.
 */
export interface Screen {
    /**
     * The screen's name.
     */
    name: string;

    /**
     * The resolved name of the application {@link Layout} this screen ultimately renders inside.
     */
    layout: string;

    /**
     * The content filling each slot, keyed by slot name.
     */
    slotContent: Record<string, SceneElement[]>;

    /**
     * The forms this screen hosts.
     */
    forms: Form[];

    /**
     * What this screen contributes to contribution points elsewhere in the tree.
     */
    contributions: Contribution[];

    /**
     * The resolved name of the {@link ScreenTemplate} this screen fills, or undefined when it fills the
     * `layout`'s own slots directly. The template's `fitsSlot` is what decides where it lands, so a screen
     * never has to state its own position.
     */
    screenTemplate?: string;
    /**
     * The behaviors attached here - what happens when someone interacts with it. Additive with whatever is
     * attached further out or further in.
     */
    behaviors?: Behavior[];

    /**
     * The modules and features, outermost first, the screen was declared in - its place in the application
     * hierarchy. It is what a destination's `module`/`feature` identity resolves against, and what a host
     * groups an unlisted screen under, so the hierarchy no longer has to be reconstructed from the
     * contributions that happen to list it. Absent or empty for a screen that sits outside any module.
     */
    path?: string[];

    /**
     * The qualified id of the slice that declared the screen - the dotted path of module, features and slice, such as
     * `Sales.Orders.PlaceOrder`, the id `ApplicationStructureIndex.findSlice` resolves. Whoever composes the document sets it, because
     * they know which slice each screen came from; nothing is ever matched by name. It is what a slice preview is scoped by: previewing
     * a slice loads the screens it owns and the screens nobody owns, never another slice's. Absent for a screen that no slice declared -
     * the application's own, a blueprint's, a hand-authored one - which belongs to the application and so to every preview.
     */
    owner?: string;
}

export const ScreenPropertyNames: (keyof Screen)[] = ['name', 'layout', 'slotContent', 'forms', 'contributions', 'screenTemplate', 'behaviors', 'path', 'owner'];
