// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What an outlet of actions, or one of its actions, acts on: Screenplay's `for item | for screen`.
 */
export enum OutletSubject {
    /** One item of the data the screen shows, such as a row of a table. */
    Item = 'item',

    /** The screen as a whole. */
    Screen = 'screen',
}
