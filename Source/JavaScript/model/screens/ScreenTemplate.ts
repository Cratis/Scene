// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '../elements';
import { Arrangement, Slot } from '../layouts';

/**
 * A reusable screen structure that fills a named slot on whatever contains it, and offers slots of its
 * own for what it contains in turn.
 *
 * A {@link Layout} and a screen template are deliberately different things. A layout is the application's
 * base navigational look — the shell with its top bar, navigation and content region — and an application
 * has one. A screen template is what goes *inside* that shell, and an application has many: one per
 * module, feature or slice that needs a shape of its own.
 *
 * `fitsSlot` is what makes them compose. A module's screen template fits the application layout's content
 * slot; a feature's screen template fits a slot the module's template declares; a slice's fits one the
 * feature's declares. The same rule at every level, so nesting is arbitrarily deep without a second
 * mechanism — and a template always states where it belongs rather than being told by whatever happens to
 * host it.
 */
export interface ScreenTemplate {
    /**
     * The template's name, which a {@link Screen} refers to.
     */
    name: string;

    /**
     * The name of the slot on the containing {@link Layout} or screen template this one fills, or
     * undefined for a template that is placed explicitly rather than by declaration.
     */
    fitsSlot?: string;

    /**
     * The slots this template offers to whatever it contains, in declaration order.
     */
    slots: Slot[];

    /**
     * How this template's own `slots` position relative to each other — the same shape a {@link Layout}
     * uses, evaluated by the same engine. Absent for declaration order with no further positioning.
     */
    arrangement?: Arrangement;

    /**
     * Content the template itself provides, keyed by slot name — the chrome a template brings with it, as
     * opposed to what a {@link Screen} based on it fills in.
     */
    content?: Record<string, SceneElement[]>;

    /**
     * A human-readable name for a template picker, falling back to `name`.
     */
    displayName?: string;

    /**
     * A one-line description for a template picker.
     */
    description?: string;
}

export const ScreenTemplatePropertyNames: (keyof ScreenTemplate)[] = [
    'name',
    'fitsSlot',
    'slots',
    'arrangement',
    'content',
    'displayName',
    'description',
];
