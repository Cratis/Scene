// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What a button of an outlet of actions shows. Whatever it shows, its title stays its accessible name.
 */
export enum OutletButtonDisplay {
    /** The icon followed by the title. The default, and what a button without an icon shows. */
    IconAndTitle = 'iconAndTitle',

    /** Only the icon; the title is the accessible name and the tooltip. A button without an icon shows its title instead. */
    Icon = 'icon',

    /** Only the title, even when the button has an icon. */
    Title = 'title',
}
