// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** What the host reports back after trying to store a profile. */
export interface ApplyUiProfileResult {
    /** Whether the profile was stored. */
    succeeded: boolean;

    /** Why it was not, in words for the user. Empty on success. */
    messages: string[];
}
