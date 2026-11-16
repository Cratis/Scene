// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DestinationReference } from '@cratis/scene.model';
import { sameDestination } from './destinationLabel';

// What the canvas is showing relative to where the author chose to be: the destination picked in *Showing* (or the one the canvas started
// on), and the one it is at now. They differ when a click on a navigation item took the content slot somewhere else - a peek (spec N2).
export interface PeekState {
    base?: DestinationReference;
    current?: DestinationReference;
}

export const isPeeking = (state: PeekState): boolean => state.base !== undefined && state.current !== undefined && !sameDestination(state.base, state.current);

// The canvas moved: a move the picker made (or the first draw) becomes the new base; any other move is a peek away from it.
export function moved(state: PeekState, destination: DestinationReference, chosen: boolean): PeekState {
    if (chosen || state.base === undefined) return { base: destination, current: destination };
    return { base: state.base, current: destination };
}
