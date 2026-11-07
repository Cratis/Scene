// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The kind of one item of an outlet. It is the `kind` every stored item carries.
 */
export enum OutletItemKind {
    /** A button of an outlet of actions. */
    Button = 'button',

    /** An entry of a menu, in an outlet of actions or one of its groups. */
    MenuEntry = 'menuEntry',

    /** A separator between actions. */
    Separator = 'separator',

    /** A group of actions shown as one menu. */
    Group = 'group',

    /** A filter of an outlet of filters. */
    Filter = 'filter',

    /** A tab of an outlet of tabs. */
    Tab = 'tab',

    /** A stat of an outlet of stats. */
    Stat = 'stat',

    /** An item of an outlet of navigation. */
    Navigation = 'navigation',
}
