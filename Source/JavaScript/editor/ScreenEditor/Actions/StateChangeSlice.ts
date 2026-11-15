// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ScreenFit } from '@cratis/scene.model';

// A State Change slice of the board's model that an action can submit. Identity is the slice id; the name is only for display.
export interface StateChangeSlice {
    id: string;
    name: string;

    // The name of the slice's command - what a stage, a Screenplay form and an exported action know it by. It is not the slice's name, which
    // is only for display; a slice that does not say has a command named as it is.
    commandName?: string;

    // The origin path from the editing scope down to the slice, for telling same-named slices apart.
    origin: string[];

    // What the slice's command needs, in the order it declares it.
    inputs: { name: string; type: string; required: boolean }[];

    // The slice has no screen of its own (StudioIssues#1331), so it can only run directly. A host that does not say is taken to say the slice has one.
    screenless?: boolean;

    // The places the slice's screen fits, in order of preference. Not saying is Scene's own default: a dialog.
    fits?: ScreenFit[];

    // The policy the slice's command authorizes with, when it has one - what hides a button from a persona that does not have it.
    authorize?: string;
}

// The name of the command a slice's command is known by.
export const commandNameOf = (slice: StateChangeSlice): string => slice.commandName ?? slice.name;

// The slice an action or a command form names as the command it submits. The editor writes the slice's id; a document read back from
// Screenplay names the command instead, so a name that only one slice's command has finds that slice too.
export function sliceNamedBy(slices: readonly StateChangeSlice[], command: unknown): StateChangeSlice | undefined {
    if (typeof command !== 'string' || command === '') return undefined;
    const byId = slices.find(slice => slice.id === command);
    if (byId) return byId;
    const byName = slices.filter(slice => commandNameOf(slice) === command);
    return byName.length === 1 ? byName[0] : undefined;
}
