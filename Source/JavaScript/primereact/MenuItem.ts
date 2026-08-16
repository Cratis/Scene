// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * One entry in a menu, menubar, breadcrumb, split button, dock or tiered menu.
 *
 * This type used to be PrimeReact's, imported from `primereact/menuitem`. PrimeReact 11 removed that
 * module along with every component that consumed it, so the shape is Scene's now.
 *
 * Owning it turns out to be the better arrangement rather than a consolation. The authored `{ label,
 * icon, items }` shape is Scene's vocabulary - it is what a `.play` file writes and what `toMenuItems`
 * produces - and it never needed to be defined by whichever component library happened to render it.
 * With the type here, the ten adapters that share it agree with each other rather than with a third
 * party, and a Cratis-owned replacement for a removed PrimeReact menu takes the same items as the
 * PrimeReact-backed ones do.
 *
 * The shape is deliberately the subset Scene actually authors, not a port of PrimeReact 10's full
 * `MenuItem`. Carrying over fields nothing reads would be inventing a contract to maintain.
 */
export interface MenuItem {
    /**
     * The text shown for the entry. Absent only on a separator, which has nothing to label.
     */
    label?: string;

    /**
     * An icon class - a `pi pi-*` class from `primeicons`, or any class an application's own icon font
     * defines.
     */
    icon?: string;

    /**
     * A navigation target. Present when the entry is a link rather than a command.
     */
    url?: string;

    /**
     * Nested entries. Any depth: a menubar and a tiered menu differ in how deep an author goes, not in
     * what they accept.
     */
    items?: MenuItem[];

    /**
     * Whether the entry is a divider rather than something selectable.
     */
    separator?: boolean;

    /**
     * Whether the entry is shown but cannot be chosen.
     */
    disabled?: boolean;

    /**
     * Invoked when the entry is chosen.
     */
    command?: () => void;
}
