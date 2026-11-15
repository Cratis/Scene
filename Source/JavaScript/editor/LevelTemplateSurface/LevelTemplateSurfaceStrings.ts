// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** The words of the template a module or a feature expands on the board: the outlets the template exposes, and hooking into them in place. */
export interface LevelTemplateSurfaceStrings {
    /** The region of the surface, named for the level: `Template of the feature Sales`. */
    region: (level: string) => string;

    /** What is said on the preview when the template exposes no outlet of the kind: `This template has no actions outlet.` */
    noOutletOfKind: (kind: string) => string;
    noOutletsAtAll: string;
    noOutletHint: string;
    chooseAnotherTemplate: string;
    addOutletToTemplate: string;

    /** The `+` of an outlet: `Add to toolbar`. */
    addTo: (outlet: string) => string;

    /** The mode of an outlet at the level, as a button that opens the three modes: `Inherit, Extend or Override toolbar`. */
    changeMode: (outlet: string, mode: string) => string;

    /** The slice picker a hook is added from. */
    hookTitle: (outlet: string) => string;
    hookSearch: string;
    hookNone: string;
    hookNoMatch: string;
    hookFrom: (path: string) => string;

    /** What was hidden at the level, with the way back. */
    hiddenHere: string;
    hiddenItem: (title: string, origin: string) => string;
    bringBack: (title: string) => string;

    /** Outlets the template exposes but does not draw: they are placed above it, so there is somewhere to hook into. */
    notDrawn: string;

    /** The slot an outlet is routed to. */
    routedTo: (slot: string) => string;

    /** The state of the surface. */
    saving: string;
    refused: string;
    zoomed: (percent: number) => string;
}

export const defaultLevelTemplateSurfaceStrings: LevelTemplateSurfaceStrings = {
    region: level => `Template of ${level}`,
    noOutletOfKind: kind => `This template has no ${kind} outlet.`,
    noOutletsAtAll: 'This template exposes no outlets, so there is nothing here to hook into.',
    noOutletHint: 'A level can only hook into the outlets its template exposes.',
    chooseAnotherTemplate: 'Choose another template',
    addOutletToTemplate: 'Add an outlet to the template',
    addTo: outlet => `Add to ${outlet}`,
    changeMode: (outlet, mode) => `${outlet}: ${mode}. Change how the level uses it`,
    hookTitle: outlet => `Hook a state change into ${outlet}`,
    hookSearch: 'Find a state change',
    hookNone: 'There is no state change on the board to hook in yet.',
    hookNoMatch: 'No state change matches.',
    hookFrom: path => `in ${path}`,
    hiddenHere: 'Hidden here',
    hiddenItem: (title, origin) => `${title} (from ${origin})`,
    bringBack: title => `Bring back ${title}`,
    notDrawn: 'The template draws none of these, so they are placed above it',
    routedTo: slot => `routed to ${slot}`,
    saving: 'Saving…',
    refused: 'The change could not be saved.',
    zoomed: percent => `${percent}%`,
};
