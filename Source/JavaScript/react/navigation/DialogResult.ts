// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** What a dialog returned when it closed, for the screen that opened it. */
export interface DialogResult {
    dialog: string;
    result?: unknown;
}
