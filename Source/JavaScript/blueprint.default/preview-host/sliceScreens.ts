// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Screen } from '@cratis/scene.model';

/**
 * The screens a slice preview loads (Cratis/Scene#207): exactly those the slice owns, and those no slice owns.
 *
 * A screen names the slice that declared it in `owner` - set by whoever composed the document, never worked out by name - so the rule is an
 * identity, not a heuristic. A screen no slice declared (the application's own, a blueprint's, a hand-authored one) is the application's and
 * is kept: the shell it is drawn in, and whatever hosts the slice's page, come with the document's layouts and templates and are not
 * screens of another slice. A screen another slice owns is never loaded: it is neither composed nor routable, so previewing one slice does
 * not pay for - or draw - the rest of the model.
 *
 * @param screens The screens of the document.
 * @param slice The qualified id of the slice being previewed.
 * @returns The screens the slice owns followed by the screens nobody owns, each in document order.
 */
export function screensForSlice(screens: Screen[], slice: string): Screen[] {
    return [...screens.filter(screen => screen.owner === slice), ...screens.filter(screen => screen.owner === undefined)];
}

/**
 * The screens a slice owns.
 *
 * @param screens The screens of the document.
 * @param slice The qualified id of the slice.
 * @returns The screens that name the slice as their owner, in document order.
 */
export function screensOwnedBy(screens: Screen[], slice: string): Screen[] {
    return screens.filter(screen => screen.owner === slice);
}
