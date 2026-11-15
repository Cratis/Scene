// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** What a row of a cascading menu is. */
export enum CascadeEntryKind {
    /** A small-caps heading over the rows below it. */
    Heading = 'heading',

    /** A sentence-case heading nested under a heading, such as a category. */
    Subheading = 'subheading',

    /** A row that does something when chosen. */
    Item = 'item',

    /** A row that opens a further panel beside the menu. */
    Submenu = 'submenu',

    /** A thin rule between groups. */
    Separator = 'separator',

    /** A line of explanation that cannot be chosen. */
    Note = 'note',
}
