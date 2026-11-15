// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Why the browser has nothing to list, which decides what it says instead. */
export enum TemplateBrowserEmpty {
    /** The application has no templates of its own yet. */
    NothingYet = 'nothing-yet',

    /** The filter matches nothing. */
    NothingMatches = 'nothing-matches',

    /** Nothing fits the target the browser was opened for. */
    NothingApplies = 'nothing-applies',

    /** The blueprint selected is not in the application's UI profile: its templates are listed but cannot be used until it is added. */
    NeedsBlueprint = 'needs-blueprint',
}
