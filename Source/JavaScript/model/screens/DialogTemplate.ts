// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '../elements';
import { Arrangement, Slot } from '../layouts';

/**
 * A reusable dialog structure — the same idea as a {@link ScreenTemplate}, for content that opens over an
 * application rather than sitting inside it.
 *
 * A dialog has no `fitsSlot` because it occupies no slot: it is an overlay, summoned by something rather
 * than placed by a containing layout. Everything else is the same, which is deliberate — a confirmation
 * dialog and a detail screen are both "slots with an arrangement, filled with content", and there is no
 * reason for an author to learn that twice.
 */
export interface DialogTemplate {
    /**
     * The template's name.
     */
    name: string;

    /**
     * The slots this template offers to whatever it contains, in declaration order.
     */
    slots: Slot[];

    /**
     * How this template's own `slots` position relative to each other. Absent for declaration order with
     * no further positioning.
     */
    arrangement?: Arrangement;

    /**
     * Content the template itself provides, keyed by slot name — a dialog's own chrome, such as its header
     * and button bar.
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

export const DialogTemplatePropertyNames: (keyof DialogTemplate)[] = [
    'name',
    'slots',
    'arrangement',
    'content',
    'displayName',
    'description',
];
