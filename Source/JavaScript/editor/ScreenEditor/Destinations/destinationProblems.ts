// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationKind, type DestinationReference } from '@cratis/scene.model';
import { DestinationProblemKind } from './DestinationProblemKind';

// What a destination can be checked against: the names the editor knows exist.
export interface DestinationTargets {
    screens: readonly string[];
    slots: readonly string[];
    dialogTemplates: readonly string[];
    slices: readonly string[];
}

const routeParameter = /^:[A-Za-z_][A-Za-z0-9_]*$/;

// Everything wrong with a destination, in the order an author would fix it. Nothing for no destination: an item without
// one simply does not navigate, which is a choice rather than a mistake.
export function destinationProblems(destination: DestinationReference | undefined, targets: DestinationTargets): DestinationProblemKind[] {
    if (!destination) return [];
    const problems: DestinationProblemKind[] = [];

    if (!destination.screen && !destination.route && !destination.dialog && !destination.slice) problems.push(DestinationProblemKind.NoTarget);
    if (destination.screen && !targets.screens.includes(destination.screen)) problems.push(DestinationProblemKind.UnknownScreen);
    if (destination.route !== undefined && !isValidRoute(destination.route, destination.kind)) problems.push(DestinationProblemKind.InvalidRoute);
    if (destination.slot && !targets.slots.includes(destination.slot)) problems.push(DestinationProblemKind.UnknownSlot);
    if (destination.dialog && !targets.dialogTemplates.includes(destination.dialog)) problems.push(DestinationProblemKind.UnknownDialog);
    if (destination.slice && !targets.slices.includes(destination.slice)) problems.push(DestinationProblemKind.UnknownSlice);
    if (destination.kind === DestinationKind.Slot && !destination.slot) problems.push(DestinationProblemKind.SlotKindWithoutSlot);
    if (destination.kind === DestinationKind.Dialog && !destination.dialog) problems.push(DestinationProblemKind.DialogKindWithoutDialog);
    if (destination.kind === DestinationKind.External && !destination.route) problems.push(DestinationProblemKind.ExternalKindWithoutRoute);

    return problems;
}

// An application route is an absolute path whose parameters are named once each. A route that leaves the application is a URL.
export function isValidRoute(route: string, kind?: DestinationKind): boolean {
    if (kind === DestinationKind.External) return isAbsoluteUrl(route);
    if (!route.startsWith('/') || /\s/.test(route) || route.includes('//')) return false;

    const parameters = route.split('/').filter(segment => segment.startsWith(':'));
    if (!parameters.every(parameter => routeParameter.test(parameter))) return false;
    return new Set(parameters).size === parameters.length;
}

function isAbsoluteUrl(route: string): boolean {
    try {
        const url = new URL(route);
        return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
        return false;
    }
}
