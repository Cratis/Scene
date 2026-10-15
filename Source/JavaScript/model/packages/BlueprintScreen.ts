// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconReference } from '../icons';

/**
 * One screen of a domain blueprint's ready-to-use screen set, with where it sits in the navigation the blueprint
 * brings. The screen itself (its layout, template and content) is a `Screen` the package provides under the same
 * name; this is the part a gallery and a navigation builder need without loading it.
 */
export interface BlueprintScreen {
    /** The name of the {@link Screen} the package provides. Unique within the screen set. */
    name: string;

    /** The title shown in the navigation and in the gallery. */
    title: string;

    /** One sentence saying what the screen is for. */
    description?: string;

    /** The name of the screen template the screen is built from, when it is built from one. */
    template?: string;

    /** The name of the screen this one sits under in the navigation; absent for a top-level screen. */
    parent?: string;

    /** Where the screen sits among its siblings; lower comes first, and screens without an order keep the order they are written in. */
    order?: number;

    /** The icon beside the title in the navigation. */
    icon?: IconReference;
}

export const BlueprintScreenPropertyNames: (keyof BlueprintScreen)[] = ['name', 'title', 'description', 'template', 'parent', 'order', 'icon'];
