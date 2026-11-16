// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// The words of the bindings lens in Preview.
export interface LensStrings {
    // The toggle in the preview strip.
    toggle: string;

    // What a hook shows: the slice it runs and where it opens. `{slice}` and `{opens}`.
    hook: string;

    // A button that is hooked to no slice.
    unlinkedHook: string;

    // What a data component shows. `{query}`.
    query: string;

    // What a filter sets. `{target}`.
    filter: string;

    // Text that is bound to nothing.
    unboundText: string;

    // What leads the reason a hook is disabled.
    disabled: string;

    // The heading of the problems the lens lists.
    problems: string;

    // The line for text bound to nothing. `{text}` and `{screen}`.
    unboundTextProblem: string;
}

export const defaultLensStrings: LensStrings = {
    toggle: 'Bindings lens',
    hook: '{slice} · {opens}',
    unlinkedHook: 'no slice',
    query: 'query {query}',
    filter: 'filter → {target}',
    unboundText: 'bound to nothing',
    disabled: 'Disabled: ',
    problems: 'Problems',
    unboundTextProblem: '“{text}” on {screen} is sample text bound to nothing. Make it a stat or bind it to a field.',
};
