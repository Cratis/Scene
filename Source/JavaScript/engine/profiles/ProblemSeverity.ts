// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** How seriously a problem stops the profile. */
export enum ProblemSeverity {
    /** The profile cannot be applied until it is resolved. */
    Blocker = 'blocker',

    /** The profile works, but the author probably does not want this. */
    Warning = 'warning',

    /** Worth knowing; nothing is wrong. */
    Info = 'info',
}
