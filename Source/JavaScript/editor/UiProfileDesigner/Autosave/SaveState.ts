// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// Where the profile stands against what is stored, as the title bar says it.
export enum SaveState {

    // Everything is stored: "All changes saved".
    Saved = 'saved',

    // An edit is waiting for the debounce to elapse: "Unsaved changes".
    Pending = 'pending',

    // A write is in flight: "Saving...".
    Saving = 'saving',

    // The last write was refused or failed: "Couldn't save - retry".
    Failed = 'failed',
}
