// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What kind of event-model slice a slice node is.
 */
export enum SliceKind {
    /** A slice that accepts a command - user input that changes state. */
    StateChange = 'StateChange',

    /** A slice that projects state into a read model for display. */
    StateView = 'StateView',

    /** A slice that reacts to events without user input. */
    Automation = 'Automation',
}
