// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationKind, type DestinationReference } from '@cratis/scene.model';
import { DestinationGroup, type ListedDestination } from '@cratis/scene.blueprint.default';

// The name of a destination as the picker and the peek bar say it: the listed label, else the screen or dialog's own name.
export function destinationLabel(destination: DestinationReference | undefined, listed: ListedDestination[]): string {
    if (destination === undefined) return '';
    const found = listed.find(candidate => sameDestination(candidate.destination, destination));
    return found?.label ?? destination.screen ?? destination.dialog ?? '';
}

// Whether two destinations lead to the same screen or dialog.
export function sameDestination(left: DestinationReference | undefined, right: DestinationReference | undefined): boolean {
    if (left === undefined || right === undefined) return left === right;
    const dialog = (destination: DestinationReference) => destination.kind === DestinationKind.Dialog || destination.dialog !== undefined;
    if (dialog(left) !== dialog(right)) return false;
    return dialog(left) ? left.dialog === right.dialog : left.screen === right.screen;
}

export { DestinationGroup };
