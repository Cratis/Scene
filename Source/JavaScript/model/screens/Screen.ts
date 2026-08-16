// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '../elements';
import { Form } from '../forms';
import { Contribution } from '../contributionPoints';

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
}

export const ScreenPropertyNames: (keyof Screen)[] = ['name', 'layout', 'slotContent', 'forms', 'contributions', 'screenTemplate'];
