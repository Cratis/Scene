// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Storyline } from './Storyline';

/** The name of the storyline a screen set keeps in screen order. */
export const defaultStorylineName = 'Default';

/**
 * The screens of a design, in order, and the storylines through them. The default storyline lists every screen in screen order: it is
 * kept that way as screens are added, removed and reordered. Other storylines are the author's; a removed screen leaves them.
 */
export interface ScreenSet {
    screens: string[];
    storylines: Storyline[];
    defaultStoryline: string;
}

export const ScreenSetPropertyNames: (keyof ScreenSet)[] = ['screens', 'storylines', 'defaultStoryline'];
